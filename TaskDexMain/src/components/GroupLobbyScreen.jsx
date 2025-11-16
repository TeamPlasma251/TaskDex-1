import React from 'react';
import { POKEMON_DATA } from '../data/pokemonData.js';

const style = {
  card: "bg-white p-6 rounded-xl shadow-lg border-2 border-gray-300",
  button: "px-6 py-3 rounded-xl font-bold transition-colors duration-300 shadow-md",
  primaryButton: "bg-red-600 text-white hover:bg-red-700",
  secondaryButton: "bg-gray-600 text-white hover:bg-gray-700",
  input: "w-full p-3 rounded-lg bg-white border-2 border-gray-300 text-black focus:border-red-500 focus:ring-2 focus:ring-red-500",
  successButton: "bg-green-600 text-white hover:bg-green-700",
  dangerButton: "bg-red-500 text-white hover:bg-red-600",
};

export default function GroupLobbyScreen({ 
  setScreen, 
  userData, 
  friendsDetail = [],
  handleGroupSessionApproval,
  handleGroupSessionReject,
  groupSessionData
}) {
  // Setup mode: configuring session before sending
  const [isSetupMode, setIsSetupMode] = React.useState(!groupSessionData?.sessionConfig);
  const [selectedFriend, setSelectedFriend] = React.useState(null);
  const [selectedType, setSelectedType] = React.useState('Psychic');
  const [studyTime, setStudyTime] = React.useState(30);
  const [restTime, setRestTime] = React.useState(5);
  const [sessionName, setSessionName] = React.useState('Group Focus Session');

  const handleInitiateGroupSession = () => {
    if (!selectedFriend) {
      alert('Please select a friend to study with!');
      return;
    }
    if (studyTime <= 0) {
      alert('Study time must be at least 1 minute!');
      return;
    }

    // Create group session config
    const config = {
      type: selectedType,
      studyTime,
      restTime,
      sessionName,
      initiatorId: userData?.id || `local-user-${userData?.trainerName}`,
      initiatorName: userData?.trainerName,
      respondentId: selectedFriend.id,
      respondentName: selectedFriend.trainerName,
      initiatorApproved: true,
      respondentApproved: false,
      status: 'PENDING', // PENDING, APPROVED, RUNNING, COMPLETED, REJECTED
      createdAt: new Date().toISOString(),
    };

    // Call handler to save to Firestore
    if (handleGroupSessionApproval) {
      handleGroupSessionApproval(config);
    }
    setIsSetupMode(false);
  };

  const handleApproveSession = () => {
    if (handleGroupSessionApproval) {
      handleGroupSessionApproval({ ...groupSessionData, respondentApproved: true, status: 'APPROVED' });
    }
  };

  const handleRejectSession = () => {
    if (handleGroupSessionReject) {
      handleGroupSessionReject(groupSessionData?.sessionId);
    }
    setIsSetupMode(true);
  };

  // Setup Mode: Friend Selection & Configuration
  if (isSetupMode && !groupSessionData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#f5f5dc] text-black">
        <div className={style.card + " max-w-2xl w-full"}>
          <h2 className="text-3xl font-bold mb-6 text-black">Start Group Session</h2>

          {/* Friend Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Study Partner:</label>
            {friendsDetail && friendsDetail.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {friendsDetail.map((friend) => (
                  <button
                    key={friend.id}
                    className={`w-full p-3 rounded-lg text-left font-semibold transition-colors ${
                      selectedFriend?.id === friend.id
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-black'
                    }`}
                    onClick={() => setSelectedFriend(friend)}
                  >
                    🎮 {friend.trainerName}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No friends available. Add friends first!</p>
            )}
          </div>

          {/* Session Type Selection */}
          {selectedFriend && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Encounter Type:</label>
                <div className="grid grid-cols-3 gap-2">
                  {POKEMON_DATA.SESSION_TYPES.map(type => (
                    <button
                      key={type}
                      className={`py-2 rounded-lg font-semibold transition-colors duration-200 ${
                        selectedType === type ? 'bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'
                      }`}
                      onClick={() => setSelectedType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Configuration */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Name:</label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className={style.input}
                    placeholder="e.g., Study For Exam"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Study Time (minutes):</label>
                  <input
                    type="number"
                    value={studyTime}
                    onChange={(e) => setStudyTime(Math.max(1, parseInt(e.target.value) || 0))}
                    className={style.input}
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rest Time (minutes):</label>
                  <input
                    type="number"
                    value={restTime}
                    onChange={(e) => setRestTime(Math.max(0, parseInt(e.target.value) || 0))}
                    className={style.input}
                    min="0"
                  />
                </div>
              </div>

              <button
                className={style.button + " " + style.primaryButton + " w-full mb-3"}
                onClick={handleInitiateGroupSession}
              >
                Send Session Request to {selectedFriend.trainerName}
              </button>
            </>
          )}

          <button
            className={style.button + " " + style.secondaryButton + " w-full"}
            onClick={() => setScreen('MAIN_MENU')}
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Approval Mode: Waiting for Response or Approval
  if (groupSessionData) {
    const isInitiator = groupSessionData.initiatorId === (userData?.id || `local-user-${userData?.trainerName}`);
    const otherPlayer = isInitiator ? groupSessionData.respondentName : groupSessionData.initiatorName;
    const bothApproved = groupSessionData.initiatorApproved && groupSessionData.respondentApproved;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#f5f5dc] text-black">
        <div className={style.card + " max-w-2xl w-full text-center"}>
          <h2 className="text-3xl font-bold mb-6 text-black">Group Session</h2>

          {/* Session Details */}
          <div className="bg-gray-100 p-6 rounded-lg mb-6 text-left">
            <h3 className="font-bold text-lg mb-3">{groupSessionData.sessionName}</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Type:</span>{' '}
                <span className="text-red-600 font-bold">{groupSessionData.type}</span>
              </p>
              <p>
                <span className="font-semibold">Study Time:</span> {groupSessionData.studyTime} minutes
              </p>
              <p>
                <span className="font-semibold">Rest Time:</span> {groupSessionData.restTime} minutes
              </p>
              <p>
                <span className="font-semibold">Initiated by:</span> {groupSessionData.initiatorName}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{' '}
                <span className={groupSessionData.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}>
                  {groupSessionData.status}
                </span>
              </p>
            </div>
          </div>

          {/* Approval Status */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <span className="font-semibold">{groupSessionData.initiatorName}</span>
              <span className={groupSessionData.initiatorApproved ? 'text-green-600 font-bold' : 'text-gray-500'}>
                {groupSessionData.initiatorApproved ? '✓ Approved' : '⏳ Waiting'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <span className="font-semibold">{groupSessionData.respondentName}</span>
              <span className={groupSessionData.respondentApproved ? 'text-green-600 font-bold' : 'text-gray-500'}>
                {groupSessionData.respondentApproved ? '✓ Approved' : '⏳ Waiting'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {!isInitiator && !groupSessionData.respondentApproved && groupSessionData.status === 'PENDING' && (
            <div className="space-y-3 mb-6">
              <button
                className={style.button + " " + style.successButton + " w-full"}
                onClick={handleApproveSession}
              >
                ✓ Approve Session
              </button>
              <button
                className={style.button + " " + style.dangerButton + " w-full"}
                onClick={handleRejectSession}
              >
                ✗ Decline Session
              </button>
            </div>
          )}

          {bothApproved && groupSessionData.status === 'APPROVED' && (
            <div className="mb-6">
              <button
                className={style.button + " " + style.primaryButton + " w-full"}
                onClick={() => setScreen('POMODORO_RUNNING')}
              >
                Start Group Session! 🎮
              </button>
            </div>
          )}

          {isInitiator && !bothApproved && (
            <p className="text-gray-600 mb-6">Waiting for {otherPlayer} to approve the session...</p>
          )}

          <button
            className={style.button + " " + style.secondaryButton + " w-full"}
            onClick={() => {
              setIsSetupMode(true);
              setScreen('MAIN_MENU');
            }}
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return null;
}

