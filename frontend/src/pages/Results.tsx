// src/pages/Results.tsx
import React, { useState, useEffect } from 'react';
import '../styles/Results.css';
import ResultsCard from '../components/ResultsCard'
import ResultsCardNormal from '../components/ResultsCardNormal'

import { useLocation } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext'; // Assuming you have a WebSocket context

const Results: React.FC = () => {
    const [results, setResults] = useState<any[]>([]);
    const location = useLocation(); // Use this to get the topic passed from TopicSelection
    const selectedMode = location.state?.selectedMode || 'Normal 1v1'; // Default to "Random" if no topic is selected

    const gameCode = location.state?.gameCode || ''; // Default to " " if no code"
    // WebSocket setup
    const socket = useWebSocket()

    // calls the backend path /results to retrieve the results stored in the database and display   
    // Fetch initial results from the backend
    useEffect(() => {
        const callGetRoundResults = async () => {
            try {
                if (selectedMode == "Normal 1v1"){
                    console.log(selectedMode, "selectedMode");
                    const response = await fetch(`http://localhost:8080/results?match_code=${gameCode}`); // Include match_code as query param
                    const data = await response.json();
                    console.log(data, "data");

                    // Set initial results if both players' data is available
                    if (data[2]?.player1 && data[2]?.player2) {
                        setResults(data);
                    } else {
                        console.log("Waiting for the other user to complete");
                    }
                }
                else {
                    console.log(selectedMode, "selectedMode");
                    const response = await fetch(`http://localhost:8080/dialogue_results?match_code=${gameCode}`); // Include match_code as query param
                    const data = await response.json();
                    console.log(data, "data");

                    // Set initial results if both players' data is available
                    if (data[2]?.player1 && data[2]?.player2) {
                        setResults(data);
                    } else {
                        console.log("Waiting for the other user to complete");
                    }
                }
            } catch (error) {
                console.error("Error calling results API:", error);
            }
        };
      
        callGetRoundResults();

        if (socket) {
            // Handle WebSocket messages
            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.action === 'results' && data.results) {
                    console.log("Received results via WebSocket", data.results);
                    setResults(data.results);
                }
            };

            // Handle WebSocket errors
            socket.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
        }

        // Cleanup on component unmount
        return () => {
            if (socket) {
                socket.onmessage = null;
                socket.onerror = null;
            }
        };
    }, [gameCode, socket]);

    return (
        <div className="container">
            <div className="white-box">
                <h1>Results: {selectedMode.toUpperCase()}</h1>
                {results && results.length > 0 ? (
                    selectedMode === "Dialogue 1v1" ? (
                        results.map((item, index) => (
                            <ResultsCard
                                key={index}
                                word={item.word}
                                pinyin={item.pinyin}
                                sample={item.sample}
                                player1={item.player1}
                                player2={item.player2}
                            />
                        ))
                    ) : selectedMode === "Normal 1v1" ? (
                        results.map((item, index) => (
                            <ResultsCardNormal
                                key={index}
                                word={item.word}
                                pinyin={item.pinyin}
                                sample={item.sample}
                                player1={item.player1}
                                player2={item.player2}
                            />
                        ))
                    ) : null
                ) : (
                    <p>Waiting for other user to complete...</p>
                )}
            </div>
        </div>
    );
};

export default Results;