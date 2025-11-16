# Friends System - Quick Visual Guide

## The Flow (Copy-Paste Version)

```
┌──────────────────────────────────────────────────────────────────┐
│                    BECOME FRIENDS - QUICK STEPS                  │
└──────────────────────────────────────────────────────────────────┘

PLAYER A (Ash)                          PLAYER B (Misty)
═══════════════════════════════════════════════════════════════════

[1] Opens TaskDex                        [Waiting]
    ↓
[2] Goes to Friends List
    Shows: "Your Trainer ID"
    ↓
[3] Copies ID
    Copies: "a1b2c3d4e5f6g7h8..."
    ↓
[4] Shares ID to Misty ────────────────→ [Receives ID via
    (Text/Email/Discord)                  Chat/Email/etc]
                                          ↓
                                      [5] Opens TaskDex
                                          ↓
                                      [6] Goes to Friends List
                                          ↓
                                      [7] "Add Friend" section
                                          Pastes: "a1b2c3d4e5f6g7h8..."
                                          ↓
                                      [8] Clicks "Send Friendship 
                                          Request"
                                          ↓
                                      [9] System Validates ✓
                                          • Format correct ✓
                                          • Not self ✓
                                          • Not duplicate ✓
                                          • Profile exists ✓
                                          ↓
                                      [10] "Success! Trainer added
                                           to your Friends List"
                                           ↓
                                      [11] Refreshes Friends List
                                           Shows: Ash (with sprite,
                                           name, partner Pokémon)

═══════════════════════════════════════════════════════════════════
RESULT: Misty can now see Ash in her Friends List
```

---

## What Each Screen Shows

### Screen 1: Friends List (Top Left)
```
┌─────────────────────────────┐
│   Your Trainer ID           │
├─────────────────────────────┤
│                             │
│  a1b2c3d4e5f6g7h8i9j0k1l2m3 │
│                             │
│  [Copy ID] button           │
│                             │
└─────────────────────────────┘
```

### Screen 2: Add Friend (Bottom Left)
```
┌─────────────────────────────┐
│   Add Friend                │
├─────────────────────────────┤
│                             │
│  [Text Input Field]         │
│  "Paste Trainer ID here"    │
│                             │
│  [Send Friendship Request]  │
│  button                     │
│                             │
│  Status: "Success!" or      │
│  "Error: ..."               │
│                             │
└─────────────────────────────┘
```

### Screen 3: Your Friends (Right Side)
```
┌────────────────────────────────────┐
│   Your Friends (1)                 │
├────────────────────────────────────┤
│                                    │
│ [👩] Misty                         │
│ z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4 │
│ Partner: Goldeen                   │
│ Status: Active                     │
│                                    │
│ [👨] Brock                         │
│ q9w8e7r6t5y4u3i2o1p0a9s8d7f6g5h4 │
│ Partner: Onix                      │
│ Status: Active                     │
│                                    │
└────────────────────────────────────┘
```

---

## Error Messages & Solutions

```
╔═══════════════════════════════════════════════════════════╗
║                   ERROR MESSAGES                          ║
╚═══════════════════════════════════════════════════════════╝

❌ "Error: Invalid Trainer ID format."
   └─ Solution: Make sure ID is at least 10 characters
               Copy the FULL ID, not just part of it

❌ "Error: You cannot add yourself!"
   └─ Solution: You can't be your own friend!
               Get a different trainer's ID

❌ "Error: This Trainer is already your friend!"
   └─ Solution: You've already added them
               They should appear in your Friends list

❌ "Error: Trainer ID not found or profile incomplete."
   └─ Solution: Either:
               • They haven't created an account yet
               • They haven't finished selecting starter Pokémon
               • They deleted their account
               
   └─ Fix: Ask them to complete their profile first
```

---

## Data That Gets Shared

### What Your Friends CAN See About You
- ✅ Your trainer name (e.g., "Ash")
- ✅ Your trainer sprite (male/female)
- ✅ Your current Pokémon partner name
- ✅ Your Trainer ID

### What Your Friends CANNOT See
- ❌ Your full Pokédex
- ❌ Your inventory details
- ❌ Your tasks
- ❌ Your achievements (unless shared separately)
- ❌ Your password or login info

---

## Validation Checks Performed

```
WHEN YOU ADD A FRIEND, SYSTEM CHECKS:

[1] Is the ID format valid?          → Minimum 10 characters
    ✓ Pass → Continue
    ✗ Fail → "Invalid Trainer ID format"
    
[2] Is it your own ID?               → Not equal to currentUserId
    ✓ Pass → Continue
    ✗ Fail → "You cannot add yourself!"
    
[3] Not already a friend?            → ID not in userData.friends
    ✓ Pass → Continue
    ✗ Fail → "Already your friend!"
    
[4] Does the profile exist?          → queryUserByUID(id) returns data
    ✓ Pass → Continue
    ✗ Fail → "Trainer ID not found"
    
[5] Is profile complete?             → isProfileComplete === true
    ✓ Pass → Continue
    ✗ Fail → "Profile incomplete"
    
[6] All checks pass?                 → Yes!
    ✓ Pass → Add to Firestore
           → Show success message
           → Reload friends list
```

---

## Database Storage (Behind the Scenes)

### Before Adding Friend
```javascript
{
  trainerName: "Misty",
  trainerGender: "female",
  pokemon_inventory: [...],
  friends: []  // Empty friends list
}
```

### After Adding "Ash"
```javascript
{
  trainerName: "Misty",
  trainerGender: "female",
  pokemon_inventory: [...],
  friends: ["a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"]  // Ash's UID added
}
```

### Later, Adding "Brock"
```javascript
{
  trainerName: "Misty",
  trainerGender: "female",
  pokemon_inventory: [...],
  friends: [
    "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",  // Ash
    "q9w8e7r6t5y4u3i2o1p0a9s8d7f6g5h4"   // Brock
  ]
}
```

---

## Two Modes: Online vs Offline

### 🌐 ONLINE MODE (Using Firebase)
```
Your ID Format:  a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
Description:     Random Firebase UID
Storage:         Firestore Cloud Database
Works across:    Multiple devices, computers, phones
Speed:           Requires internet
```

### 💾 OFFLINE MODE (Local Storage)
```
Your ID Format:  local-user-Ash
Description:     Based on your trainer name
Storage:         Browser localStorage
Works across:    Same browser only
Speed:           Instant, no internet needed
```

---

## Common Questions (FAQ)

### Q: Can they see my tasks?
A: No, only your trainer name, sprite, and Pokémon partner.

### Q: What if I make a typo in their ID?
A: System will say "Trainer ID not found". Copy the full ID again.

### Q: Can I remove a friend?
A: Not yet in the current version. Enhancement coming soon!

### Q: Do they have to add me back?
A: Currently no (one-directional). Enhancement idea: mutual friends.

### Q: Will they know I added them?
A: Depends on implementation. Current version: no notification.

### Q: What if they delete their account?
A: They'll appear as "User Deleted" in your friends list.

### Q: Can I add the same person twice?
A: No, system prevents duplicates.

### Q: Does it work offline?
A: Yes! Uses local-user-{name} format with localStorage.

---

## Step-by-Step VISUAL Example

```
STEP 1: Player A Opens Friends List
┌────────────────────────────┐
│ Friends List & Multiplayer │
│                            │
│ Your Trainer ID:           │
│ abc123def456...            │
│                            │
│ [Copy ID Button]  ◄── Click here
└────────────────────────────┘
                    ↓
                (ID Copied)
                    ↓
STEP 2: Player A Shares ID (Outside App)
┌────────────────────────────────────────┐
│ Chat between Ash and Misty:            │
│                                        │
│ Ash: "My ID is: abc123def456..."       │
│      [Ready for you to add me]         │
│                                        │
│ Misty: "Got it! Let me add you..."     │
└────────────────────────────────────────┘
                    ↓
STEP 3: Player B (Misty) Opens Friends List
┌────────────────────────────┐
│ Friends List & Multiplayer │
│                            │
│ Add Friend                 │
│ [Input Field]              │
│ [Paste ID here]  ◄── Click here
│                            │
│ [Send Request Button]      │
└────────────────────────────┘
                    ↓
STEP 4: Misty Pastes and Sends
┌────────────────────────────┐
│ Add Friend                 │
│ [abc123def456...]          │ ◄── Pasted
│                            │
│ [Send Request Button]  ◄── Click here
└────────────────────────────┘
                    ↓
STEP 5: Success!
┌────────────────────────────────────────┐
│ ✅ Success! Trainer added to your      │
│    Friends List.                       │
└────────────────────────────────────────┘
                    ↓
STEP 6: View in Friends List
┌────────────────────────────────────────┐
│ Your Friends (1)                       │
│                                        │
│ [👨] Ash                               │
│ abc123def456...                        │
│ Partner: Charmander                    │
│ Status: Active                         │
│                                        │
└────────────────────────────────────────┘
```

---

## Code Implementation Reference

### Adding a Friend (Main Function)
```javascript
async handleAddFriend() {
  1. Validate ID format
  2. Check not self
  3. Check not duplicate
  4. Query Firestore for friend
  5. Check profile complete
  6. updateDoc() with arrayUnion(friendID)
  7. Show success message
  8. Refresh friends list
}
```

### Fetching Friends (useEffect)
```javascript
useEffect(() => {
  for (friendID in userData.friends) {
    const profile = queryUserByUID(friendID)
    Extract: name, gender, partner, status
    Add to UI list
  }
}, [userData.friends])  // Re-run when friends list changes
```

### Key Files
```
src/
├─ components/
│  └─ FriendsListScreen.jsx    ◄── Main friends UI
├─ utils/
│  ├─ firebaseHelpers.js       ◄── queryUserByUID()
│  └─ storage.js               ◄── localStorage fallback
└─ hooks/
   └─ useAppState.js           ◄── Firebase integration
```

---

## 🎯 Summary Checklist

- [ ] Player A gets their Trainer ID
- [ ] Player A copies and shares ID with Player B
- [ ] Player B opens Friends List
- [ ] Player B pastes ID in "Add Friend" section
- [ ] Player B clicks "Send Friendship Request"
- [ ] System validates ✓
- [ ] Player B sees success message ✓
- [ ] Player B refreshes, sees Player A in Friends List ✓
- [ ] Player B can view Player A's profile info ✓

**Done! You're now connected!** 🎉
