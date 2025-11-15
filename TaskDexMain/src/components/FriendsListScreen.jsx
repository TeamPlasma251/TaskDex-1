import React from 'react';
import { getGifUrl } from '../utils/sprites.js';
import { queryUserByUID } from '../utils/firebaseHelpers.js';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { app, db } from '../config/firebase.js';

const style = {
  card: "bg-white p-6 rounded-xl shadow-lg border-2 border-gray-300",
  button: "px-6 py-3 rounded-xl font-bold transition-colors duration-300 shadow-md",
  primaryButton: "bg-red-600 text-white hover:bg-red-700",
  secondaryButton: "bg-gray-600 text-white hover:bg-gray-700",
  input: "w-full p-3 rounded-lg bg-white border-2 border-gray-300 text-black focus:border-red-500 focus:ring-2 focus:ring-red-500",
};

export default function FriendsListScreen({ setScreen, userData }) {
  const [friendIdInput, setFriendIdInput] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [friendsDetail, setFriendsDetail] = React.useState([]);
  const [loadingFriends, setLoadingFriends] = React.useState(false);
  
  const currentUserId = app ? getAuth(app).currentUser?.uid : null;
  
  // Fetch details for all friends listed in userData.friends
  React.useEffect(() => {
    const fetchFriendsDetails = async () => {
      if (!userData || !userData.friends || userData.friends.length === 0) {
        setFriendsDetail([]);
        return;
      }
      
      setLoadingFriends(true);
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
        } else {
          details.push({ id: friendId, isProfileComplete: false, partnerName: 'User Deleted', trainerName: '???' });
        }
      }
      
      setFriendsDetail(details);
      setLoadingFriends(false);
    };
    
    fetchFriendsDetails();
  }, [userData?.friends]);
  
  const handleAddFriend = async () => {
    setMessage('');
    if (!friendIdInput || friendIdInput.length < 10) { // Basic sanity check for UID length
      setMessage("Error: Invalid Trainer ID format.");
      return;
    }
    
    if (friendIdInput === currentUserId) {
      setMessage("Error: You cannot add yourself!");
      return;
    }
    
    if (userData.friends.includes(friendIdInput)) {
      setMessage("Error: This Trainer is already your friend!");
      return;
    }
    
    const friendProfile = await queryUserByUID(friendIdInput);
    if (friendProfile && friendProfile.isProfileComplete) {
      try {
        if (db && currentUserId) {
          const userDocRef = doc(db, 'artifacts', 'default-app-id', 'users', currentUserId, 'profile', 'data');
          await updateDoc(userDocRef, {
            friends: arrayUnion(friendIdInput)
          });
          setMessage(`Success! Trainer added to your Friends List.`);
          setFriendIdInput('');
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
  
  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-[#f5f5dc] text-black">
      <div className={style.card + " max-w-4xl w-full mt-12"}>
        <h2 className="text-4xl font-bold mb-4 text-black">Friends List & Multiplayer Hub</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: My ID & Copy ID */}
          <div className="md:col-span-1 space-y-4">
            <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
              <h3 className="text-xl font-semibold mb-2">Your Trainer ID</h3>
              <p className="font-mono text-sm break-all text-yellow-600 mb-3 select-all">
                {currentUserId || `local-user-${userData?.trainerName || 'trainer'}`}
              </p>
              <button 
                className={style.secondaryButton + " w-full py-2 text-sm"} 
                onClick={() => {
                  const idToCopy = currentUserId || `local-user-${userData?.trainerName || 'trainer'}`;
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(idToCopy);
                    setMessage('ID copied to clipboard!');
                  } else {
                    const tempInput = document.createElement('textarea');
                    tempInput.value = idToCopy;
                    document.body.appendChild(tempInput);
                    tempInput.select();
                    document.execCommand('copy');
                    document.body.removeChild(tempInput);
                    setMessage('ID copied to clipboard!');
                  }
                }}
              >
                Copy ID
              </button>
            </div>
            
            <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
              <h3 className="text-xl font-semibold mb-3">Add Friend</h3>
              <input
                type="text"
                value={friendIdInput}
                onChange={(e) => setFriendIdInput(e.target.value)}
                placeholder="Paste Trainer ID here..."
                className={style.input + " mb-3"}
              />
              <button 
                className={style.primaryButton + " w-full"}
                onClick={handleAddFriend}
              >
                Send Friendship Request
              </button>
              {message && <p className={`mt-2 text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
            </div>
          </div>
          
          {/* Column 2 & 3: Friend List */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-2xl font-semibold text-black">Your Friends ({userData?.friends?.length || 0})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loadingFriends ? (
                <p className="text-gray-700">Loading friends data...</p>
              ) : friendsDetail.length === 0 ? (
                <p className="text-gray-700 p-4 bg-gray-100 rounded-lg border-2 border-gray-300">You haven't added any friends yet. Share your ID!</p>
              ) : (
                friendsDetail.map(friend => (
                  <div key={friend.id} className="flex items-center p-3 bg-gray-100 rounded-lg shadow-inner justify-between border-2 border-gray-300">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={getGifUrl(friend.trainerGender === 'female' ? 'TrainerFemale' : 'TrainerMale')} 
                        alt="Trainer"
                        style={{ width: '32px', height: '32px', imageRendering: 'pixelated' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl("Placeholder"); }}
                      />
                      <div>
                        <p className="font-semibold text-lg">{friend.trainerName}</p>
                        <p className="text-xs font-mono text-gray-600 break-all">{friend.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">Partner: {friend.partnerName}</p>
                      <p className="text-xs text-gray-600">Status: Active</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button 
              className={style.button + " bg-red-600 text-white hover:bg-red-700 w-full"}
              onClick={() => setScreen('GROUP_LOBBY')}
            >
              Start/Join Group Session
            </button>
          </div>
        </div>
        
        <button
          className={style.button + " " + style.secondaryButton + " mt-8"}
          onClick={() => setScreen('MAIN_MENU')}
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}

