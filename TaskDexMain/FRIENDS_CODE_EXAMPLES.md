# Friends System - Code Examples & Reference

## 📖 How the Current System Works (Code Deep Dive)

### 1. Getting Your Trainer ID

**File:** `src/components/FriendsListScreen.jsx` (lines 21-24)

```javascript
const currentUserId = app ? getAuth(app).currentUser?.uid : null;

// In JSX:
{currentUserId || `local-user-${userData?.trainerName || 'trainer'}`}
```

**Logic:**
- If Firebase is available → Use Firebase UID
- If offline → Use local-user-{name}

**Example Output:**
```
Online:  a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
Offline: local-user-Ash
```

---

### 2. Copying ID to Clipboard

**File:** `src/components/FriendsListScreen.jsx` (lines 116-128)

```javascript
onClick={() => {
  const idToCopy = currentUserId || `local-user-${userData?.trainerName || 'trainer'}`;
  if (navigator.clipboard) {
    // Modern browsers
    navigator.clipboard.writeText(idToCopy);
    setMessage('ID copied to clipboard!');
  } else {
    // Older browsers fallback
    const tempInput = document.createElement('textarea');
    tempInput.value = idToCopy;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    setMessage('ID copied to clipboard!');
  }
}}
```

**What Happens:**
1. Gets the current user's ID
2. Tries modern clipboard API
3. Falls back to older method if needed
4. Shows "ID copied to clipboard!" message

---

### 3. Adding a Friend (The Core Logic)

**File:** `src/components/FriendsListScreen.jsx` (lines 58-86)

```javascript
const handleAddFriend = async () => {
  setMessage('');  // Clear previous message
  
  // Step 1: Validate ID format
  if (!friendIdInput || friendIdInput.length < 10) {
    setMessage("Error: Invalid Trainer ID format.");
    return;
  }
  
  // Step 2: Check if it's not their own ID
  if (friendIdInput === currentUserId) {
    setMessage("Error: You cannot add yourself!");
    return;
  }
  
  // Step 3: Check if not already a friend
  if (userData.friends.includes(friendIdInput)) {
    setMessage("Error: This Trainer is already your friend!");
    return;
  }
  
  // Step 4: Query the friend's profile from Firestore
  const friendProfile = await queryUserByUID(friendIdInput);
  
  // Step 5: Verify they exist and have completed profile
  if (friendProfile && friendProfile.isProfileComplete) {
    try {
      if (db && currentUserId) {
        // Step 6: Add to Firestore
        const userDocRef = doc(
          db,
          'artifacts',
          'default-app-id',
          'users',
          currentUserId,
          'profile',
          'data'
        );
        
        // Add friend ID to the friends array
        await updateDoc(userDocRef, {
          friends: arrayUnion(friendIdInput)
        });
        
        // Step 7: Show success and reset input
        setMessage(`Success! Trainer added to your Friends List.`);
        setFriendIdInput('');
        
        // Step 8: Friends list will auto-update via useEffect
      } else {
        setMessage("Error: Firebase not available.");
      }
    } catch (e) {
      setMessage("Error adding friend. Please try again.");
      console.error("Error adding friend:", e);
    }
  } else {
    setMessage("Error: Trainer ID not found or profile incomplete.");
  }
};
```

**Flow Diagram:**
```
User clicks "Send Friendship Request"
         ↓
Validate ID format (min 10 chars)
         ↓
Check not self-add
         ↓
Check not duplicate
         ↓
Query Firestore for friend profile
         ↓
Check profile exists & complete
         ↓
Update Firestore: friends.push(friendId)
         ↓
Show success message
         ↓
Clear input field
         ↓
useEffect detects change → Fetches all friends
         ↓
Friends list updates on screen
```

---

### 4. Fetching All Friends' Details

**File:** `src/components/FriendsListScreen.jsx` (lines 27-52)

```javascript
React.useEffect(() => {
  const fetchFriendsDetails = async () => {
    // If no friends, show empty list
    if (!userData || !userData.friends || userData.friends.length === 0) {
      setFriendsDetail([]);
      return;
    }
    
    setLoadingFriends(true);
    const details = [];
    
    // For each friend ID in userData.friends array
    for (const friendId of userData.friends) {
      // Query their profile
      const profile = await queryUserByUID(friendId);
      
      if (profile) {
        // Extract the info we need
        details.push({ 
          id: friendId,
          isProfileComplete: profile.isProfileComplete,
          trainerGender: profile.trainerGender,
          trainerName: profile.trainerName || 'Friend',
          partnerName: profile.pokemon_inventory?.find(p => p.isPartner)?.currentName || '???',
        });
      } else {
        // If profile doesn't exist (user deleted), show placeholder
        details.push({
          id: friendId,
          isProfileComplete: false,
          partnerName: 'User Deleted',
          trainerName: '???'
        });
      }
    }
    
    setFriendsDetail(details);  // Update state
    setLoadingFriends(false);
  };
  
  fetchFriendsDetails();  // Run on mount and when friends change
}, [userData?.friends]);  // Dependency: re-run when friends array changes
```

**What It Does:**
1. Listens for changes to `userData.friends`
2. For each friend ID, queries their profile
3. Extracts relevant data (name, sprite, partner)
4. Stores in `friendsDetail` state
5. Shows loading spinner while fetching

---

### 5. Querying a Friend's Profile

**File:** `src/utils/firebaseHelpers.js` (lines 1-18)

```javascript
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';

export const queryUserByUID = async (uid) => {
  // Guard against no database or invalid uid
  if (!db || !uid) return null;
  
  try {
    // Reference to friend's profile document
    const userDocRef = doc(
      db,
      'artifacts',           // Collection
      'default-app-id',      // App ID
      'users',               // Users collection
      uid,                   // Friend's UID
      'profile',             // Subcollection
      'data'                 // Document
    );
    
    // Get the document
    const docSnap = await getDoc(userDocRef);
    
    // Return the data if it exists
    if (docSnap.exists()) {
      return docSnap.data();  // Full user object
    }
    return null;  // User doesn't exist
  } catch (e) {
    console.error("Error querying user:", e);
    return null;  // Error occurred
  }
};
```

**Path Structure:**
```
artifacts/
  default-app-id/
    users/
      {friendUID}/
        profile/
          data  ← Returns this whole object
```

**Data Returned:**
```javascript
{
  trainerName: "Ash",
  trainerGender: "male",
  isProfileComplete: true,
  pokedex: [...],
  pokemon_inventory: [
    {
      id: "123",
      currentName: "Charmander",
      isPartner: true,
      ...
    },
    ...
  ],
  friends: ["uid1", "uid2"],
  achievements: [...],
}
```

---

### 6. Displaying the Friends List

**File:** `src/components/FriendsListScreen.jsx` (lines 159-185)

```javascript
<div className="space-y-3 max-h-96 overflow-y-auto">
  {loadingFriends ? (
    <p className="text-gray-700">Loading friends data...</p>
  ) : friendsDetail.length === 0 ? (
    <p className="text-gray-700 p-4 bg-gray-100 rounded-lg">
      You haven't added any friends yet. Share your ID!
    </p>
  ) : (
    friendsDetail.map(friend => (
      <div key={friend.id} className="flex items-center p-3 bg-gray-100 rounded-lg shadow-inner justify-between">
        {/* Left side: Trainer info */}
        <div className="flex items-center space-x-3">
          {/* Trainer sprite image */}
          <img 
            src={getGifUrl(
              friend.trainerGender === 'female' 
                ? 'TrainerFemale' 
                : 'TrainerMale'
            )} 
            alt="Trainer"
            style={{ 
              width: '32px', 
              height: '32px', 
              imageRendering: 'pixelated' 
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = getGifUrl("Placeholder");
            }}
          />
          
          {/* Trainer name and ID */}
          <div>
            <p className="font-semibold text-lg">{friend.trainerName}</p>
            <p className="text-xs font-mono text-gray-600">
              {friend.id}
            </p>
          </div>
        </div>
        
        {/* Right side: Partner and status */}
        <div className="text-right">
          <p className="text-sm text-green-600">
            Partner: {friend.partnerName}
          </p>
          <p className="text-xs text-gray-600">
            Status: Active
          </p>
        </div>
      </div>
    ))
  )}
</div>
```

**Renders:**
```
┌───────────────────────────────────────┐
│ [👩] Misty                    Active   │
│ z9y8x7w6v5u4t3...                    │
│ Partner: Goldeen              (right) │
└───────────────────────────────────────┘
```

---

## 🔌 How Data Flows

### When You Add a Friend:

```
handleAddFriend()
  ↓
Validate inputs (5 checks)
  ↓
Query friend profile: queryUserByUID(id)
  ↓
Update Firestore: updateDoc({ friends: arrayUnion(id) })
  ↓
Show success message
  ↓
[userData.friends] changes (detected by Firestore listener)
  ↓
useAppState triggers state update
  ↓
Component receives new userData
  ↓
useEffect dependency [userData?.friends] fires
  ↓
fetchFriendsDetails() runs
  ↓
For each friend ID: queryUserByUID(friendId)
  ↓
Build details array with name, gender, partner
  ↓
setFriendsDetail(details)
  ↓
Component re-renders
  ↓
Shows updated friends list on screen
```

**Time Flow:**
```
T=0s   User clicks "Send Friendship Request"
T=0.1s Validation complete, queries Firestore
T=0.5s Friend profile found, update begins
T=1s   Success message shows
T=1.2s useEffect detects change
T=1.5s Fetching friend details from Firestore
T=2s   Details received, state updated
T=2.1s Component re-renders with new friend visible
```

---

## 💾 Firebase Firestore Structure

### Before Adding Friend:

```javascript
// User A's Profile
{
  path: "artifacts/default-app-id/users/userA/profile/data"
  data: {
    trainerName: "Ash",
    trainerGender: "male",
    pokemon_inventory: [...],
    pokedex: [...],
    friends: []  // Empty
  }
}
```

### After User B Adds User A:

```javascript
// User B's Profile (Updated)
{
  path: "artifacts/default-app-id/users/userB/profile/data"
  data: {
    trainerName: "Misty",
    trainerGender: "female",
    pokemon_inventory: [...],
    pokedex: [...],
    friends: ["userA_UID"]  // Added!
  }
}

// User A's Profile (Unchanged - unless you implement bi-directional)
{
  path: "artifacts/default-app-id/users/userA/profile/data"
  data: {
    trainerName: "Ash",
    trainerGender: "male",
    pokemon_inventory: [...],
    pokedex: [...],
    friends: []  // Still empty
  }
}
```

---

## 🚀 Implementation Example: Add Remove Friend

### Step 1: Add handler function

**File:** `src/components/FriendsListScreen.jsx`

**Add this function (after `handleAddFriend`):**

```javascript
const handleRemoveFriend = async (friendId) => {
  // Confirm with user
  if (!window.confirm(`Remove ${friendId} from friends?`)) {
    return;
  }
  
  try {
    if (!db || !currentUserId) {
      setMessage("Error: Firebase not available.");
      return;
    }
    
    // Remove friend from array
    const newFriendsList = userData.friends.filter(id => id !== friendId);
    
    // Update Firestore
    const userDocRef = doc(
      db,
      'artifacts',
      'default-app-id',
      'users',
      currentUserId,
      'profile',
      'data'
    );
    
    await updateDoc(userDocRef, {
      friends: newFriendsList
    });
    
    setMessage('Friend removed.');
  } catch (e) {
    setMessage("Error removing friend.");
    console.error(e);
  }
};
```

### Step 2: Add remove button to friend card

**File:** `src/components/FriendsListScreen.jsx`

**Modify the friend card (around line 180):**

```javascript
friendsDetail.map(friend => (
  <div key={friend.id} className="flex items-center p-3 bg-gray-100 rounded-lg shadow-inner justify-between">
    {/* Existing left side code... */}
    <div className="flex items-center space-x-3">
      {/* ...trainer sprite and name... */}
    </div>
    
    {/* New: Right side with partner and remove button */}
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm text-green-600">
          Partner: {friend.partnerName}
        </p>
        <p className="text-xs text-gray-600">
          Status: Active
        </p>
      </div>
      
      {/* NEW: Remove button */}
      <button
        onClick={() => handleRemoveFriend(friend.id)}
        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-bold"
      >
        Remove
      </button>
    </div>
  </div>
))
```

**Result:**
```
┌──────────────────────────────────────────────┐
│ [👩] Misty          Partner: Goldeen [Remove]│
│ z9y8x7w6v5u4t3...   Status: Active         │
└──────────────────────────────────────────────┘
```

---

## 🔄 Implementation Example: Bi-Directional Friends

### Modify `handleAddFriend` to add both users:

**File:** `src/components/FriendsListScreen.jsx`

**After line 82 (after successfully updating current user's friends):**

```javascript
// OLD CODE (lines 77-85):
await updateDoc(userDocRef, {
  friends: arrayUnion(friendIdInput)
});
setMessage(`Success! Trainer added to your Friends List.`);
setFriendIdInput('');

// NEW CODE: Add current user to their friends list too
if (db && currentUserId) {
  const friendDocRef = doc(
    db,
    'artifacts',
    'default-app-id',
    'users',
    friendIdInput,
    'profile',
    'data'
  );
  
  try {
    await updateDoc(friendDocRef, {
      friends: arrayUnion(currentUserId)
    });
  } catch (e) {
    console.error("Could not add you to their list:", e);
  }
}

setMessage(`Success! Trainer added to your Friends List.`);
setFriendIdInput('');
```

**Result:**
- ✅ User A's friends list: [User B]
- ✅ User B's friends list: [User A]  ← NEW!

---

## 🧪 Testing Code Examples

### Test: Add Friend via Console

```javascript
// In browser console (while on Friends List screen):

// Get your ID
document.querySelector('p[style*="yellow"]').textContent

// Simulate adding a friend (you need their ID)
const friendID = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6";
document.querySelector('input[placeholder*="Paste"]').value = friendID;
document.querySelector('button:contains("Send")').click();
```

### Test: Check Friends in Console

```javascript
// View your current friends
JSON.stringify(userData.friends, null, 2)

// View friend details
console.log(friendsDetail)
```

---

## 📊 Common Patterns

### Pattern 1: Check if Someone is Your Friend

```javascript
const isFriend = (userId) => {
  return userData.friends?.includes(userId) || false;
};

// Usage:
if (isFriend("uid123")) {
  console.log("They are your friend");
}
```

### Pattern 2: Get Friend Count

```javascript
const friendCount = userData.friends?.length || 0;
console.log(`You have ${friendCount} friends`);
```

### Pattern 3: Get Mutual Friends (A ↔ B)

```javascript
const getMutualFriends = async (userA_id, userB_id) => {
  const profileA = await queryUserByUID(userA_id);
  const profileB = await queryUserByUID(userB_id);
  
  const mutual = profileA.friends.filter(id => 
    profileB.friends.includes(id)
  );
  
  return mutual;
};
```

### Pattern 4: Find Friends by Name

```javascript
const findFriendsByName = (searchName) => {
  return friendsDetail.filter(friend =>
    friend.trainerName.toLowerCase().includes(searchName.toLowerCase())
  );
};

// Usage:
const results = findFriendsByName("Ash");
```

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Not checking if profile is complete

```javascript
// WRONG:
const friendProfile = await queryUserByUID(friendId);
await updateDoc(userRef, { friends: arrayUnion(friendId) });

// RIGHT:
const friendProfile = await queryUserByUID(friendId);
if (friendProfile && friendProfile.isProfileComplete) {
  await updateDoc(userRef, { friends: arrayUnion(friendId) });
}
```

### ❌ Mistake 2: Not handling offline mode

```javascript
// WRONG:
const currentUserId = getAuth(app).currentUser.uid;

// RIGHT:
const currentUserId = app ? getAuth(app).currentUser?.uid : null;
const id = currentUserId || `local-user-${userData?.trainerName}`;
```

### ❌ Mistake 3: Not cleaning up useEffect

```javascript
// WRONG:
useEffect(() => {
  fetchFriends();
}, []); // Missing dependency = might not update

// RIGHT:
useEffect(() => {
  fetchFriends();
}, [userData?.friends]); // Re-run when friends change
```

### ❌ Mistake 4: Hardcoding paths

```javascript
// WRONG:
const path = "artifacts/default-app-id/users/...";

// RIGHT:
const userDocRef = doc(
  db,
  'artifacts',
  'default-app-id',
  'users',
  currentUserId,
  'profile',
  'data'
);
```

---

## 📝 Summary

The friends system works by:

1. **Get ID** → User gets unique Firebase UID
2. **Share ID** → User shares with friend (out of app)
3. **Add Friend** → Friend pastes ID, validates, adds to Firestore
4. **Fetch Details** → System queries friend's profile
5. **Display** → Shows friend info in list

**Key Files:**
- `FriendsListScreen.jsx` — Main UI (210 lines)
- `firebaseHelpers.js` — `queryUserByUID()` function
- `useAppState.js` — Firestore integration

**Key Operations:**
- `queryUserByUID(uid)` — Get friend's profile
- `updateDoc(..., { friends: arrayUnion(id) })` — Add friend
- `useEffect` — Re-fetch when friends change

That's the complete system! 🎉
