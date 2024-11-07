import React, { useEffect, useState } from 'react';
import '../styles/ResultsNormal.css';

interface PlayerProps {
  username: string;
  audio: string;  // Base64 encoded string
  score: ScoreProps;
  word: string;
  pinyin: string;
  sample: string;
}

interface ScoreProps {
  overall: string;
  accuracy: string;
  completeness: string;
  fluency: string;
}

interface ResultsNormalCardProps {
  word: string;
  pinyin: string;
  sample: string;  // Base64 encoded sample audio
  player1: PlayerProps;
  player2: PlayerProps;
}

const ResultsCardNormal: React.FC<ResultsNormalCardProps> = ({ word, pinyin, sample, player1, player2 }) => {
  const [sampleAudioURL1, setSampleAudioURL1] = useState<string | null>(null);
  const [player1AudioURL, setPlayer1AudioURL] = useState<string | null>(null);
  const [player2AudioURL, setPlayer2AudioURL] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string>(""); // New state for the translation

  const displayWord1 = word || player1.word;
  const sampleWord1 = sample || player1.sample;

  useEffect(() => {
    console.log("Rendering ResultsDialogueCard");

    // Function to convert Base64 to Object URL
    const decodeBase64Audio = (base64String: string): string => {
      const binaryString = atob(base64String);
      const binaryLen = binaryString.length;
      const bytes = new Uint8Array(binaryLen);

      for (let i = 0; i < binaryLen; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    };

    // Decode and set the audio URLs
    if (sampleWord1) {
      setSampleAudioURL1(decodeBase64Audio(sampleWord1));
    }
    if (player1.audio) {
      setPlayer1AudioURL(decodeBase64Audio(player1.audio));
    }
    if (player2.audio) {
      setPlayer2AudioURL(decodeBase64Audio(player2.audio));
    }

    // Translation API call for displayWord1
    const translateText = async () => {
      try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh&tl=en&dt=t&q=${encodeURIComponent(displayWord1)}`);
        const data = await response.json();
        setTranslation(data[0][0][0]); // Set translated text
      } catch (error) {
        console.error("Translation API error:", error);
        setTranslation("Translation unavailable");
      }
    };

    translateText();

    // Clean up object URLs to prevent memory leaks
    return () => {
      if (sampleAudioURL1) URL.revokeObjectURL(sampleAudioURL1);
      if (player1AudioURL) URL.revokeObjectURL(player1AudioURL);
      if (player2AudioURL) URL.revokeObjectURL(player2AudioURL);
    };
  }, [sample, player1.audio, player2.audio, displayWord1]);

  return (
    <div className="card">
      <div className="panel-container">
        <div className="panel2">
          <h2 className="result-word">Sample Answer</h2>
          <h3 className="result-word">{pinyin}</h3>
          <h3 className="result-word">{displayWord1}</h3>
          {sampleAudioURL1 && (
            <div className="audio-player">
              <audio controls src={sampleAudioURL1} />
            </div>
          )}
          <h2 className="translate-header" >English Translation </h2>
          <h3 className="translate-word">{translation}</h3> {/* Display the translation */}
        </div>
        <div className="panel">
          <div className="player-result">
            <h2 className="result-word">{player1.username}'s Answer</h2>
            {player1AudioURL && (
              <div className="audio-player">
                <audio controls src={player1AudioURL} />
              </div>
            )}
            <p className="result-word score">Overall Score: {player1.score.overall}</p>
            <p className="result-word">Completeness Score: {player1.score.completeness}</p>
            <p className="result-word">Acccuracy Score: {player1.score.accuracy}</p>
            <p className="result-word">Fluency Score: {player1.score.fluency}</p>
          </div>
          <hr className="divider" />

          <div className="player-result">
            <h2 className="result-word">{player2.username}'s Answer</h2>
            {player2AudioURL && (
              <div className="audio-player">
                <audio controls src={player2AudioURL} />
              </div>
            )}
            <p className="result-word score">Overall Score: {player2.score.overall}</p>
            <p className="result-word">Completeness Score: {player2.score.completeness}</p>
            <p className="result-word">Acccuracy Score: {player2.score.accuracy}</p>
            <p className="result-word">Fluency Score: {player2.score.fluency}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsCardNormal;