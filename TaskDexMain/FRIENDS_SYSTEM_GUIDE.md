# TaskDex Friends System: Step-by-Step Guide

## Overview
The friends system allows two players to connect using Trainer IDs and view each other's profiles. The system uses Firebase Firestore for cloud sync and localStorage for offline support.

---

## 📋 System Components

### 1. **Data Storage Structure**
Each user has a `userData` object that includes:
```javascript
{
  trainerName: "Ash",
  trainerGender: "male",
  isProfileComplete: true,
  pokemon_inventory: [...],
  pokedex: [...],
  friends: ["uid1", "uid2", "uid3"],  // Array of friend UIDs
  achievements: [...],
}
```

### 2. **Key Files**
- `src/components/FriendsListScreen.jsx` — UI for adding/viewing friends
- `src/utils/firebaseHelpers.js` — `queryUserByUID()` function to fetch friend data
- `src/utils/storage.js` — localStorage persistence
- `src/hooks/useAppState.js` — Main state management with Firebase integration

---

## 🎯 Step-by-Step Process: How Two People Become Friends

### **STEP 1: Get Your Trainer ID**

**Location:** Friends List screen → "Your Trainer ID" section

**What Happens:**
1. User navigates to Friends List
2. System displays their unique Firebase UID (or `local-user-{trainerName}` if offline)
3. User clicks "Copy ID" button to copy it to clipboard

**Code Reference:**
```javascript
// FriendsListScreen.jsx
const currentUserId = app ? getAuth(app).currentUser?.uid : null;
// Displays: currentUserId || `local-user-${userData?.trainerName || 'trainer'}`
```

**Example IDs:**
- Firebase: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
- Offline: `local-user-Ash`

---

### **STEP 2: Share Your ID**

**What Happens:**
1. Player A copies their Trainer ID
2. Player A shares it with Player B through any channel (email, chat, Discord, etc.)

**Example Flow:**
```
Player A: "My Trainer ID is: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
Player B: "Got it! Here's mine: z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4"
```

---

### **STEP 3: Add Friend (Player A adds Player B)**

**Location:** Friends List → "Add Friend" section

**Input Field:** Paste friend's Trainer ID

**Process:**
1. Player A pastes Player B's ID into the input field
2. Player A clicks "Send Friendship Request"
3. System validates the ID:
   - ✅ ID format is correct (minimum 10 characters)
   - ✅ Not their own ID
   - ✅ Not already a friend
   - ✅ Friend's profile exists and is complete

**Code Flow:**
```javascript
const handleAddFriend = async () => {
  // 1. Validate input
  if (!friendIdInput || friendIdInput.length < 10) {
    setMessage("Error: Invalid Trainer ID format.");
    return;
  }
  
  // 2. Check it's not themselves
  if (friendIdInput === currentUserId) {
    setMessage("Error: You cannot add yourself!");
    return;
  }
  
  // 3. Check not already a friend
  if (userData.friends.includes(friendIdInput)) {
    setMessage("Error: This Trainer is already your friend!");
    return;
  }
  
  // 4. Verify friend exists and is profile complete
  const friendProfile = await queryUserByUID(friendIdInput);
  if (friendProfile && friendProfile.isProfileComplete) {
    // 5. Add to Firestore
    const userDocRef = doc(db, 'artifacts', 'default-app-id', 'users', currentUserId, 'profile', 'data');
    await updateDoc(userDocRef, {
      friends: arrayUnion(friendIdInput)  // Add friend UID to array
    });
    setMessage(`Success! Trainer added to your Friends List.`);
  }
};
```

**Status Messages:**
- ✅ `"Success! Trainer added to your Friends List."` — Friend added!
- ❌ `"Error: Invalid Trainer ID format."` — ID too short or invalid
- ❌ `"Error: You cannot add yourself!"` — Tried to add themselves
- ❌ `"Error: This Trainer is already your friend!"` — Already connected
- ❌ `"Error: Trainer ID not found or profile incomplete."` — Friend doesn't exist or hasn't completed setup

---

### **STEP 4: System Fetches Friend Profile Data**

**What Happens Behind the Scenes:**
1. Friend ID is added to `userData.friends` array in Firestore
2. Component re-renders and calls `fetchFriendsDetails()`
3. For each friend ID, system queries Firestore:
   ```javascript
   const profile = await queryUserByUID(friendId);
   ```

**Data Fetched from Friend:**
```javascript
{
  id: "z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4",
  isProfileComplete: true,
  trainerGender: "female",
  trainerName: "Misty",
  partnerName: "Goldeen",  // Current partner Pokemon
}
```

**Code:**
```javascript
React.useEffect(() => {
  const fetchFriendsDetails = async () => {
    const details = [];
    
    for (const friendId of userData.friends) {
      const profile = await queryUserByUID(friendId);
      if (profile) {
        details.push({ 
          id: friendId, 
          isProfileComplete: profile.isProfileComplete,
          trainerGender: profile.trainerGender,
          trainerName: profile.trainerName || 'Friend',
          partnerName: profile.pokemon_inventory?.find(p => p.isPartner)?.currentName || '???',
        });
      }
    }
    
    setFriendsDetail(details);
  };
  
  fetchFriendsDetails();
}, [userData?.friends]);
```

---

### **STEP 5: View Friend Profile**

**Location:** Friends List → "Your Friends" section

**Displayed Information:**
- 👤 Friend's trainer sprite (male/female)
- 📝 Trainer name (e.g., "Misty")
- 🆔 Trainer ID (for copying/reference)
- 🔴 Current partner Pokémon name
- 📊 Status: "Active"

**Card Display:**
```
┌─────────────────────────────────────┐
│ [Trainer Sprite] Misty              │
│ z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4  │
│                                     │
│          Partner: Goldeen           │
│          Status: Active             │
└─────────────────────────────────────┘
```

---

### **STEP 6: Both Players See Each Other (Optional)**

**How Bi-Directional Friendship Works:**

Currently, the system is **one-directional**:
- Player A can see Player B (after adding them)
- BUT Player B won't see Player A unless they also add Player A

**To Make It Bi-Directional:**

Modify `handleAddFriend()` to add both players to each other's friends list:

```javascript
// Add THIS code after successfully adding friend
if (db && currentUserId && friendIdInput) {
  // Add Player A to Player B's friends list
  const friendDocRef = doc(db, 'artifacts', 'default-app-id', 'users', friendIdInput, 'profile', 'data');
  await updateDoc(friendDocRef, {
    friends: arrayUnion(currentUserId)  // Add current user to friend's list
  });
}
```

This way:
- ✅ Player A sees Player B
- ✅ Player B automatically sees Player A

---

## 🔄 Data Flow Diagram

```
Player A (Console A)
    ↓
[Friends List Screen]
    ↓
[Get Trainer ID] → Copies ID
    ↓
[Shares ID to Player B] (out of app)
    ↓
Player B (Console B)
    ↓
[Friends List Screen]
    ↓
[Add Friend Section] → Pastes Player A's ID
    ↓
[Send Friendship Request]
    ↓
System Validates:
  • ID format ✓
  • Not self ✓
  • Not already friend ✓
  • Profile exists ✓
    ↓
[Firestore Update]
  userData.friends.push(playerId_A)
    ↓
[Fetch Friend Profile]
  queryUserByUID(playerId_A)
    ↓
[Display in Friends List]
  • Trainer name
  • Partner Pokémon
  • Trainer sprite
  • Status
```

---

## 🛠️ Testing: How to Test Friend Connection Locally

### **Scenario: Two Players on Same Machine**

1. **Open Game in Private Window #1 (Player A)**
   - Sign up: "Ash"
   - Complete profile with starter Pokémon
   - Go to Friends List
   - **Copy ID** (note it)

2. **Open Game in Private Window #2 (Player B)**
   - Sign up: "Misty"
   - Complete profile with starter Pokémon
   - Go to Friends List
   - Go to "Add Friend"

3. **In Window #2 (Player B)**
   - Paste Player A's ID into input field
   - Click "Send Friendship Request"
   - Wait for success message

4. **Verify in Window #2**
   - "Your Friends" section shows Ash
   - Displays Ash's trainer sprite, name, and partner

5. **[OPTIONAL] Bi-Directional: In Window #1 (Player A)**
   - Refresh or navigate away
   - Check Friends List → Misty should appear (if bi-directional code added)

---

## 📱 Online vs Offline Mode

### **With Firebase (Online)**
- ✅ Uses real Firebase UIDs
- ✅ Data syncs to cloud (Firestore)
- ✅ IDs look like: `a1b2c3d4e5f6g7h8...`
- ✅ Works across devices

### **Without Firebase (Offline)**
- ✅ Uses local ID: `local-user-{trainerName}`
- ✅ Data stored in browser localStorage
- ✅ IDs look like: `local-user-Ash`
- ❌ Only works on same device/browser

**Detection Code:**
```javascript
const currentUserId = app ? getAuth(app).currentUser?.uid : null;
// If null → offline mode, use local-user-{name}
```

---

## 🐛 Common Issues & Fixes

### **Issue 1: "Error: Trainer ID not found"**
- **Cause:** Friend hasn't completed their profile yet
- **Fix:** Friend must finish starter selection first

### **Issue 2: "Invalid Trainer ID format"**
- **Cause:** ID is less than 10 characters
- **Fix:** Make sure full ID is copied (no truncation)

### **Issue 3: Friends list shows "User Deleted"**
- **Cause:** Friend's profile was deleted from Firestore
- **Fix:** Remove them from your friends list

### **Issue 4: Can't find friend even with correct ID**
- **Cause:** Firebase connection issue
- **Fix:** Check console for errors, ensure Firestore rules allow reads

### **Issue 5: Friends only see each other after mutual adds**
- **Cause:** System is one-directional by default
- **Fix:** Implement bi-directional code (see STEP 6)

---

## 💾 Database Structure in Firestore

```
Firestore Structure:
artifacts/
  └─ default-app-id/
      └─ users/
          ├─ {uid_A}/
          │   └─ profile/
          │       └─ data
          │           ├─ trainerName: "Ash"
          │           ├─ trainerGender: "male"
          │           ├─ pokemon_inventory: [...]
          │           ├─ pokedex: [...]
          │           └─ friends: ["{uid_B}", "{uid_C}"]  ← Friend list
          │
          └─ {uid_B}/
              └─ profile/
                  └─ data
                      ├─ trainerName: "Misty"
                      ├─ trainerGender: "female"
                      ├─ pokemon_inventory: [...]
                      ├─ pokedex: [...]
                      └─ friends: ["{uid_A}"]  ← Also has Ash if bi-directional
```

---

## ✅ Summary: 5-Minute Quick Start

1. **Player A** → Friends List → Copy ID
2. **Share** ID to Player B (text, email, etc.)
3. **Player B** → Friends List → Add Friend → Paste ID → Click "Send"
4. **Wait** for confirmation message ✓
5. **View** Player A in Friends List with their profile info

**That's it!** 🎉

---

## 🔧 Enhancement Ideas

- [ ] **Friendship Requests** — Pending/Accept/Decline workflow
- [ ] **View Full Friend Profile** — Click friend card to see details
- [ ] **Friend Status** — Online/Offline/Last seen
- [ ] **Remove Friend** — Delete from friends list
- [ ] **Block Friend** — Prevent someone from adding you
- [ ] **Search by Name** — Find friends without ID copy/paste
- [ ] **Friend Categories** — Best Friends, Recent, etc.
- [ ] **Friend Chat** — Direct messaging
- [ ] **Multiplayer Battles** — Battle with friend's Pokémon
- [ ] **Gift Items** — Send items to friends
