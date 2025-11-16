# Group Session Feature Guide

## Overview

The Group Session feature allows two friends to start a synchronized Pomodoro study session together where **both players must approve the session configuration before it begins**.

---

## 🎮 How It Works

### Step 1: Initiating a Group Session

1. Navigate to **Group Lobby** from the main menu
2. The initiator sees a **Setup Mode**:
   - Select a study partner from their friends list
   - Choose the encounter type (Psychic, Fire, Water, etc.)
   - Set study time (minutes)
   - Set rest time (minutes)
   - Name the session (optional)
3. Click **"Send Session Request to [Friend Name]"**

### Step 2: Respondent Reviews the Request

1. The respondent receives the group session request
2. They see the session details:
   - Session name
   - Encounter type
   - Study and rest times
   - Initiator's approval status ✓
   - Respondent's approval status ⏳

### Step 3: Mutual Approval

**Initiator's View:**
```
Session Details:
  Name: Study For Exam
  Type: Psychic
  Study: 30 minutes
  Rest: 5 minutes
  
Status:
  Ash ✓ Approved
  Misty ⏳ Waiting
  
[Waiting for Misty to approve...]
```

**Respondent's View:**
```
Session Details:
  Name: Study For Exam
  Type: Psychic
  Study: 30 minutes
  Rest: 5 minutes
  
Status:
  Ash ✓ Approved
  Misty ⏳ Waiting

[✓ Approve Session] [✗ Decline Session]
```

### Step 4: Session Begins

Once **both players approve**:
- Session status changes to **APPROVED** ✓
- A **"Start Group Session!"** button appears for both
- Both players click to start the synchronized session
- Session type, study time, and rest time are identical for both

### Step 5: During the Session

```
Title: Study For Exam

🎮 Group Session with Misty
Both players must stay focused!

Timer: [25:43]
Work Session 1/4
● ● ○ ○

[Wild Pokemon Encounter...]
```

- Both see the same Pomodoro timer
- Both encounter the same session type Pokemon
- Study phase time is synchronized
- Rest phase allows catching Pokemon

### Step 6: Session Ends

After all sessions complete:
- Both are returned to main menu
- Session data is saved
- Both can start new sessions or group sessions

---

## 🔄 Session States

### PENDING
- Initiator has approved ✓
- Respondent hasn't approved yet ⏳
- **Action:** Respondent must Approve or Decline

### APPROVED
- Both players have approved ✓ ✓
- **Action:** Both can click "Start Group Session!"

### RUNNING
- One or both players have started the session
- Session is actively running
- **Status:** Can't cancel (must complete or let timer expire)

### COMPLETED
- Session finished naturally or abandoned
- Both return to main menu
- Session results are saved

### REJECTED
- Respondent clicked "Decline"
- Session is terminated
- Both can initiate new sessions

---

## 📂 Data Structure

### Group Session Document (Firestore)

```javascript
{
  sessionId: "uuid-1234-5678",
  
  // Configuration
  type: "Psychic",              // Same for both
  studyTime: 30,                // Minutes - same for both
  restTime: 5,                  // Minutes - same for both
  sessionName: "Study For Exam",
  
  // Player Info
  initiatorId: "uid-ash",
  initiatorName: "Ash",
  respondentId: "uid-misty",
  respondentName: "Misty",
  
  // Approval Status
  initiatorApproved: true,      // Set when initiator creates
  respondentApproved: false,    // Set when respondent approves
  
  // Session Status
  status: "PENDING",            // PENDING, APPROVED, RUNNING, COMPLETED, REJECTED
  
  // Metadata
  createdAt: "2025-11-16T10:30:00Z",
  startedAt: null,              // Set when both approve and session starts
  completedAt: null,            // Set when session finishes
}
```

### User Profile Extension

```javascript
// In userData
{
  trainerName: "Ash",
  friends: ["uid-misty", ...],
  activeGroupSession: "sessionId-1234",  // Current group session (if any)
}
```

---

## 💾 Data Persistence

### Firestore Storage
- **Location:** `/artifacts/default-app-id/group_sessions/{sessionId}`
- **Backup Location:** `/artifacts/default-app-id/users/{userId}/profile/data`
  - Field: `activeGroupSession` (stores current session ID)

### localStorage Backup
- **Location:** `groupSessions` key
- **Format:** JSON object with session IDs as keys
- **Purpose:** Offline support, quick access

---

## 🔐 Validation & Rules

### Approval Rules
1. **Only initiator can change session config** before approval
   - Respondent sees read-only session details
2. **Initiator is auto-approved** when sending request
3. **Respondent must explicitly approve** to proceed
4. **Both must approve before session starts**

### Session Type Matching
- Both players see and encounter the **same Pokémon type**
- Study time is **identical**
- Rest time is **identical**

### Participant Requirements
1. Both must be friends
2. Both profiles must be complete
3. Both must be available (no other active sessions)

### Rejection Rules
1. Respondent can decline at any time before approval
2. Initiator cannot force the session
3. Session is deleted when rejected
4. Either can initiate a new session request

---

## 🎯 Features & Behavior

### Synchronized Experience
```
Timeline:
10:30:00 - Ash initiates group session
10:30:05 - Misty receives request
10:30:15 - Misty approves
10:30:16 - Both see "APPROVED" status
10:30:20 - Both click "Start Group Session!"
10:30:21 - RUNNING - Both see same timer
10:30:51 - Work phase completes (30 min)
          Both encounter Pokemon simultaneously
11:00:25 - Break phase completes (5 min)
          Both see same Pokemon selection
11:00:26 - Session 2/4 begins
          Timer synchronized for both
...
11:30:00 - All 4 sessions complete
11:30:01 - Both redirected to main menu
```

### Display Elements

#### Group Session Indicator (During Session)
```
🎮 Group Session with [Friend Name]
Both players must stay focused!
```

#### Approval Status Cards
```
[Friend Name]
✓ Approved     OR     ⏳ Waiting
```

#### Action Buttons
- **Approve:** Only shown to non-initiator, only when status = PENDING
- **Decline:** Only shown to non-initiator, only when status = PENDING
- **Start Group Session:** Only shown when both approved

---

## 🐛 Error Handling

### Friend Not Available
```
Error: Friend doesn't have a complete profile yet
Action: Friend must complete starter selection first
```

### Network Issues
- Session data cached in localStorage
- Syncs when connection restored
- Falls back to local time if needed

### Session Cancellation
```
If initiator closes app before respondent approves:
- Session remains in PENDING state
- Respondent can still approve/decline
- Can be cleaned up manually or auto-expired

If respondent closes app:
- Initiator sees "Waiting for response"
- Respondent can return and approve/decline
- Session stays open until action taken
```

### Sync Issues
- Both players' timers should stay within 1-2 seconds of each other
- Server timestamps used as source of truth
- Client times adjust if drift detected

---

## 📊 Integration Points

### Components
- **GroupLobbyScreen.jsx:** UI for setup and approval
- **PomodoroRunningScreen.jsx:** Session execution with group indicator
- **App.jsx:** Navigation between group session and pomodoro

### State Management (useAppState.js)
```javascript
// State variables
groupSessionData          // Current group session data
friendsDetail            // List of friends for selection

// Handlers
handleGroupSessionApproval(sessionConfig)  // Create/update session
handleGroupSessionReject(sessionId)        // Decline or cancel session

// Effects
- Fetch friends when userData.friends changes
- Listen to group session updates from Firestore
- Clean up on unmount
```

### Data Flow
```
GroupLobbyScreen
    ↓
handleGroupSessionApproval()
    ↓
setDoc() to Firestore (/group_sessions/{id})
    ↓
updateDoc() user profile (activeGroupSession field)
    ↓
setGroupSessionData() state
    ↓
onSnapshot() listener watches for changes
    ↓
Respondent sees updated session
    ↓
Respondent calls handleGroupSessionApproval() with approval
    ↓
Both can now start session
```

---

## 🚀 Future Enhancements

### Priority 1 (Easy)
- [ ] Session history/past group sessions
- [ ] Invite by friend name search
- [ ] Session completion stats comparison

### Priority 2 (Medium)
- [ ] Real-time status updates (online indicator)
- [ ] Session leaderboard (who caught more Pokemon)
- [ ] Shared encounter log

### Priority 3 (Hard)
- [ ] Live chat during sessions
- [ ] Synchronized battle during breaks
- [ ] Group achievements/badges
- [ ] Weekly group session challenges

---

## 📝 Code Examples

### Initiating a Session (Frontend)

```javascript
const handleInitiateGroupSession = () => {
  const config = {
    type: selectedType,           // "Psychic"
    studyTime,                    // 30
    restTime,                     // 5
    sessionName,                  // "Study For Exam"
    initiatorId: userData?.id,
    initiatorName: userData?.trainerName,
    respondentId: selectedFriend.id,
    respondentName: selectedFriend.trainerName,
    initiatorApproved: true,      // Auto-approve initiator
    respondentApproved: false,    // Waiting for respondent
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  // Call handler to save
  handleGroupSessionApproval(config);
};
```

### Approving a Session (Backend)

```javascript
const handleGroupSessionApproval = useCallback(async (sessionConfig) => {
  const sessionId = crypto.randomUUID();
  const sessionData = {
    ...sessionConfig,
    sessionId,
  };

  // Save to Firestore
  if (user && db) {
    const groupSessionRef = doc(db, 'artifacts', 'default-app-id', 'group_sessions', sessionId);
    await setDoc(groupSessionRef, sessionData);

    const userDocRef = doc(db, 'artifacts', 'default-app-id', 'users', user.uid, 'profile', 'data');
    await updateDoc(userDocRef, {
      activeGroupSession: sessionId,
    });
  }

  setGroupSessionData(sessionData);
}, [user, db]);
```

---

## ✅ Testing Checklist

- [ ] Can initiate group session
- [ ] Initiator sees friends list
- [ ] Can select session type
- [ ] Can set study/rest times
- [ ] Respondent receives request
- [ ] Respondent sees session details (read-only)
- [ ] Respondent can approve
- [ ] Both see "APPROVED" status after approval
- [ ] Both can start session
- [ ] Session runs with same timer
- [ ] Session shows group indicator
- [ ] Encounters are same type for both
- [ ] Both can catch Pokemon during break
- [ ] Session completes successfully
- [ ] Both return to main menu
- [ ] Can decline session
- [ ] Declined sessions are deleted

---

## 🎓 Learning Notes

### Key Concepts

1. **Dual Approval Pattern**
   - Initiator auto-approves by sending
   - Respondent must explicitly approve
   - Prevents accidental session starts

2. **Synchronized Sessions**
   - Same type, times, and schedule
   - Encourages accountability
   - Shared Pokemon encounters

3. **Offline Support**
   - localStorage backup for each player
   - Syncs when online
   - Works in offline mode with local timer

4. **Real-time Updates**
   - Firestore listeners for changes
   - Auto-sync when respondent approves
   - Responsive UI updates

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| Friend not in list | Check if they're added as friend |
| Can't start session | Both players must approve first |
| Timer out of sync | Refresh, both times should sync within 2 sec |
| Session disappeared | Check localStorage or Firestore |
| Can't approve | Make sure you're not the initiator |

---

## Summary

The Group Session feature creates an **accountability partnership** where two friends must mutually agree on and execute a synchronized Pomodoro study session. The dual-approval system ensures both players are committed before starting, while identical session parameters create a truly shared experience.

**Key Principle:** Both players must approve before sessions start. 🎮✨
