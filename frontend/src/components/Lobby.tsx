// src/pages/RoomSelection.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { useWebSocket } from '../contexts/WebSocketContext';

const Lobby: React.FC = () => {
  const [inviteCode, setInviteCode] = useState<string>(''); // State to hold access code
  const [errorMessage, setErrorMessage] = useState<string>(''); // State to handle errors
  const socket = useWebSocket(); // Access WebSocket from context
  const navigate = useNavigate();

  useEffect(() => {
    if (socket) {
      socket.onopen = () => {
        console.log('Connected to WebSocket');
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.status === 'success') {
          // Navigate to the match page on successful room join
          navigate('/match');
        } else if (data.status === 'error') {
          setErrorMessage(data.message); // Display error message on invalid code
        }
      };
    }

    return () => {
      // Clean up WebSocket connection when the component unmounts
      if (socket) {
        socket.onmessage = null
      }
    };
  }, [socket, navigate]);

  const handleJoinRoom = () => {
    if (socket && inviteCode.trim()) {
      // Send the access code to the WebSocket for validation
      const message = JSON.stringify({
        action: 'join',
        code: inviteCode.trim(),
      });
      socket.send(message);
    }
  };

  const handleCreateRoom = () => {
    navigate("/matchmaking")
  }

  return (
    <div className="container">
      <div className="white-box">
        <h1>Lobby</h1>
        <div className="panel-container">
          <div className="panel">
            <button className="accent-button" onClick={handleCreateRoom}>Create Room</button>
          </div>
          <div className="panel">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
            />
            <button className="accent-button" onClick={handleJoinRoom}>Join Room</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
