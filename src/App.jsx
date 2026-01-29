import React, { useState, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import './App.css'

// 音名のデータ構造（学習ポイント：オブジェクトの配列）
// 各音に内部キー、表示ラベル、色を持つ
const notes = [
  { key: 'A', label: 'A', color: '#C9171E' },                    // 赤
  { key: 'A#', label: 'A#/Bb', color: '#65318E' },              // 赤と青の間
  { key: 'B', label: 'B', color: '#0054A6' },                    // 青
  { key: 'C', label: 'C', color: '#ffff00' },                    // 黄色
  { key: 'C#', label: 'C#/Db', color: '#d29b3d' },               // 黄色と茶色の間
  { key: 'D', label: 'D', color: '#a0522d' },                    // 茶色
  { key: 'D#', label: 'D#/Eb', color: '#504916' },               // 茶色と緑の間
  { key: 'E', label: 'E', color: '#008000' },                    // 緑
  { key: 'F', label: 'F', color: '#B2D235' },                    // 黄緑
  { key: 'F#', label: 'F#/Gb', color: '#99a65a' },                // 黄緑とグレーの間
  { key: 'G', label: 'G', color: '#808080' },                    // グレー
  { key: 'G#', label: 'G#/Ab', color: '#A44B4F' },               // グレーと赤の間
]

// コードの構成音データ（学習ポイント：オブジェクトでデータを管理）
// メジャーコード: ルート、長3度、完全5度
// マイナーコード: ルート、短3度、完全5度
const chordNotes = {
  // メジャーコード（シャープ表記）
  'C': ['C', 'E', 'G'],
  'C#': ['C#', 'F', 'G#'],
  'D': ['D', 'F#', 'A'],
  'D#': ['D#', 'G', 'A#'],
  'E': ['E', 'G#', 'B'],
  'F': ['F', 'A', 'C'],
  'F#': ['F#', 'A#', 'C#'],
  'G': ['G', 'B', 'D'],
  'G#': ['G#', 'C', 'D#'],
  'A': ['A', 'C#', 'E'],
  'A#': ['A#', 'D', 'F'],
  'B': ['B', 'D#', 'F#'],
  // メジャーコード（フラット表記）
  'Db': ['Db', 'F', 'Ab'],      // C#と同じ音だが、フラット表記
  'Eb': ['Eb', 'G', 'Bb'],      // D#と同じ音だが、フラット表記
  'Gb': ['Gb', 'Bb', 'Db'],     // F#と同じ音だが、フラット表記
  'Ab': ['Ab', 'C', 'Eb'],      // G#と同じ音だが、フラット表記
  'Bb': ['Bb', 'D', 'F'],       // A#と同じ音だが、フラット表記
  // マイナーコード（シャープ表記）
  'Cm': ['C', 'D#', 'G'],
  'C#m': ['C#', 'E', 'G#'],
  'Dm': ['D', 'F', 'A'],
  'D#m': ['D#', 'F#', 'A#'],
  'Em': ['E', 'G', 'B'],
  'Fm': ['F', 'G#', 'C'],
  'F#m': ['F#', 'A', 'C#'],
  'Gm': ['G', 'A#', 'D'],
  'G#m': ['G#', 'B', 'D#'],
  'Am': ['A', 'C', 'E'],
  'A#m': ['A#', 'C#', 'F'],
  'Bm': ['B', 'D', 'F#'],
  // マイナーコード（フラット表記）
  'Dbm': ['Db', 'E', 'Ab'],     // C#mと同じ音だが、フラット表記
  'Ebm': ['Eb', 'Gb', 'Bb'],    // D#mと同じ音だが、フラット表記
  'Gbm': ['Gb', 'A', 'Db'],     // F#mと同じ音だが、フラット表記
  'Abm': ['Ab', 'B', 'Eb'],     // G#mと同じ音だが、フラット表記
  'Bbm': ['Bb', 'Db', 'F'],     // A#mと同じ音だが、フラット表記
}

// 利用可能なコード名のリスト（学習ポイント：Object.keysでオブジェクトのキーを取得）
const allChords = Object.keys(chordNotes)

function App() {
  // 出題設定を管理するstate（学習ポイント：useStateで複数の値を管理）
  const [questionSettings, setQuestionSettings] = useState({
    includeMajor: true,    // メジャーコードを含む
    includeMinor: true,    // マイナーコードを含む
  })

  // 出題可能なコードのリストを取得する関数（学習ポイント：配列のfilter）
  const getAvailableChords = () => {
    return allChords.filter(chord => {
      const isMinor = chord.endsWith('m')
      if (isMinor && !questionSettings.includeMinor) return false
      if (!isMinor && !questionSettings.includeMajor) return false
      return true
    })
  }

  // ランダムにコードを選ぶ関数（学習ポイント：Math.randomと配列操作）
  const getRandomChord = () => {
    const availableChords = getAvailableChords()
    if (availableChords.length === 0) return allChords[0] // フォールバック
    const randomIndex = Math.floor(Math.random() * availableChords.length)
    return availableChords[randomIndex]
  }

  // 現在の問題のコード名を管理するstate（学習ポイント：useState）
  const [currentChord, setCurrentChord] = useState(() => getRandomChord())
  
  // 選択された音を管理するstate（学習ポイント：配列をstateで管理）
  const [selectedNotes, setSelectedNotes] = useState([])

  // 設定アコーディオンの開閉状態
  const [settingsOpen, setSettingsOpen] = useState(false)

  // 設定変更時に新しい問題を選ぶ（学習ポイント：useEffect）
  useEffect(() => {
    const availableChords = getAvailableChords()
    if (availableChords.length > 0 && !availableChords.includes(currentChord)) {
      // 現在のコードが選択範囲外の場合は新しいコードを選ぶ
      setCurrentChord(getRandomChord())
      setSelectedNotes([])
    }
  }, [questionSettings])

  // 次の問題に進む関数（学習ポイント：複数のstateを更新）
  const handleNextQuestion = () => {
    // 新しいコードを選ぶ（現在のコードと異なるものを選ぶ）
    const availableChords = getAvailableChords()
    let newChord = getRandomChord()
    while (newChord === currentChord && availableChords.length > 1) {
      newChord = getRandomChord()
    }
    setCurrentChord(newChord)
    // 選択状態をリセット
    setSelectedNotes([])
  }

  // 設定変更ハンドラー（学習ポイント：イベントハンドラーとオブジェクトの更新）
  const handleSettingChange = (setting, value) => {
    setQuestionSettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  // 音を選択する関数（学習ポイント：イベントハンドラーと配列操作）
  const handleNoteClick = (note) => {
    // すでに選択されている場合は削除、されていない場合は追加
    if (selectedNotes.includes(note)) {
      setSelectedNotes(selectedNotes.filter(n => n !== note))
    } else {
      setSelectedNotes([...selectedNotes, note])
    }
  }

  // フラット表記をシャープ表記に変換する関数（学習ポイント：オブジェクトのマッピング）
  const flatToSharp = (note) => {
    const flatToSharpMap = {
      'Bb': 'A#',
      'Db': 'C#',
      'Eb': 'D#',
      'Gb': 'F#',
      'Ab': 'G#',
    }
    return flatToSharpMap[note] || note
  }

  // シャープ表記をフラット表記に変換する関数（学習ポイント：オブジェクトのマッピング）
  const sharpToFlat = (note) => {
    const sharpToFlatMap = {
      'A#': 'Bb',
      'C#': 'Db',
      'D#': 'Eb',
      'F#': 'Gb',
      'G#': 'Ab',
    }
    return sharpToFlatMap[note] || note
  }

  // コード名がフラット表記かどうかを判定する関数
  const isFlatNotation = (chordName) => {
    const flatChords = ['Db', 'Eb', 'Gb', 'Ab', 'Bb', 'Dbm', 'Ebm', 'Gbm', 'Abm', 'Bbm']
    return flatChords.includes(chordName)
  }

  // ルートを基準とした順序で選択された音をソートする関数（学習ポイント：配列操作とソート）
  const getSortedSelectedNotes = () => {
    // ルートのインデックスを見つける（コード名からルート音を抽出）
    let rootNote = currentChord.replace('m', '') // 'Cm' → 'C', 'Bbm' → 'Bb'
    
    // フラット表記の場合はシャープ表記に変換
    rootNote = flatToSharp(rootNote)
    
    const rootIndex = notes.findIndex(n => n.key === rootNote)
    if (rootIndex === -1) return selectedNotes

    // ルートから始まる順序でnotes配列を回転
    const rotatedNotes = [...notes.slice(rootIndex), ...notes.slice(0, rootIndex)]
    
    // 選択された音を、回転したnotes配列の順序でソート
    return selectedNotes.sort((a, b) => {
      const indexA = rotatedNotes.findIndex(n => n.key === a)
      const indexB = rotatedNotes.findIndex(n => n.key === b)
      return indexA - indexB
    })
  }

  // 正解判定関数（学習ポイント：配列の比較と論理演算）
  const checkAnswer = () => {
    const correctNotes = chordNotes[currentChord] || []
    
    // 選択された音を、フラット表記のコードの場合はフラット表記に変換して比較
    // （選択された音は内部的にシャープ表記のキーで管理されているため）
    let selectedNotesForComparison = selectedNotes
    if (isFlatNotation(currentChord)) {
      selectedNotesForComparison = selectedNotes.map(note => sharpToFlat(note))
    }
    
    // 選択された音と正解の音を比較（順序は関係なく、含まれる音が一致するか）
    const selectedSet = new Set(selectedNotesForComparison)
    const correctSet = new Set(correctNotes)
    
    // 配列の長さが同じで、すべての音が一致するかチェック
    if (selectedSet.size !== correctSet.size) {
      return false
    }
    
    // すべての正解の音が選択されているかチェック（every関数は、配列のすべての要素に対して、条件を満たすかどうかをチェックする）
    return correctNotes.every(note => selectedSet.has(note))
  }

  // 正解判定の結果を取得
  const isCorrect = checkAnswer()

  // コード名からルート音の色を取得する関数（学習ポイント：データの検索）
  const getChordColor = () => {
    // コード名からルート音を抽出（'Cm' → 'C', 'Bbm' → 'Bb'）
    let rootNote = currentChord.replace('m', '')
    
    // フラット表記の場合はシャープ表記に変換して検索
    rootNote = flatToSharp(rootNote)
    
    // notes配列から対応する色を取得
    const note = notes.find(n => n.key === rootNote)
    return note ? note.color : '#667eea' // 見つからない場合はデフォルト色
  }

  // 正解時に canvas-confetti で紙吹雪を表示（物理演算でリアルな動き）
  const confettiFiredRef = useRef(false)
  const chordColors = ['#C9171E', '#65318E', '#0054A6', '#ffff00', '#d29b3d', '#a0522d', '#504916', '#008000', '#B2D235', '#99a65a', '#808080', '#A44B4F']

  useEffect(() => {
    if (selectedNotes.length >= 3 && isCorrect && !confettiFiredRef.current) {
      confettiFiredRef.current = true

      const fire = (options = {}) => {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: chordColors,
          ticks: 400,
          gravity: 1.2,
          scalar: 1.1,
          ...options,
        })
      }

      fire()
      fire({ spread: 100, startVelocity: 35, origin: { x: 0.2, y: 0.6 } })
      fire({ spread: 100, startVelocity: 35, origin: { x: 0.8, y: 0.6 } })
    }
    if (selectedNotes.length < 3 || !isCorrect) {
      confettiFiredRef.current = false
    }
  }, [isCorrect, selectedNotes.length])

  return (
    <div className="app">
      <header className="app-header">
        <button
          type="button"
          id="settings-toggle"
          className="settings-gear-btn"
          onClick={() => setSettingsOpen(!settingsOpen)}
          aria-expanded={settingsOpen}
          aria-controls="settings-panel"
          aria-label="設定を開く"
          title="settings"
        >
          <svg className="settings-gear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M19.78 4.22l-1.42 1.42M5.64 18.36l-1.42 1.42" />
          </svg>
        </button>
        <h1>chord quiz</h1>
        {selectedNotes.length >= 3 && isCorrect && (
          <button
            type="button"
            className="next-question-button next-question-button--header"
            onClick={handleNextQuestion}
          >
            next question
          </button>
        )}
      </header>

      <div
        id="settings-panel"
        className={`settings-section ${settingsOpen ? 'settings-section--open' : ''}`}
        role="region"
        aria-labelledby="settings-toggle"
        aria-hidden={!settingsOpen}
      >
        <h3 className="settings-section-title">settings</h3>
        <div className="settings-options">
          <label className="setting-checkbox">
            <input
              type="checkbox"
              checked={questionSettings.includeMajor}
              onChange={(e) => handleSettingChange('includeMajor', e.target.checked)}
            />
            <span>major chords</span>
          </label>
          <label className="setting-checkbox">
            <input
              type="checkbox"
              checked={questionSettings.includeMinor}
              onChange={(e) => handleSettingChange('includeMinor', e.target.checked)}
            />
            <span>minor chords</span>
          </label>
        </div>
        <p className="settings-info">
          available: {getAvailableChords().length} types
        </p>
      </div>

      <div className="quiz-container">
        <div className="question">
          <h2>question</h2>
          <p 
            className="chord-name"
            style={{ color: getChordColor() }}
          >
            {currentChord}
          </p>
        </div>
        
        {/* 選択肢の表示（学習ポイント：mapメソッドで配列をレンダリング） */}
        <div className="answer-section">
          <div className={`answer-choices ${selectedNotes.length >= 3 && isCorrect ? 'answer-choices--hidden' : ''}`}>
            <h3>select the notes of the chord</h3>
            <div className="notes-grid">
              {notes.map((note) => {
                const isSelected = selectedNotes.includes(note.key)
                return (
                  <button
                    key={note.key}
                    className={`note-button ${isSelected ? 'selected' : ''}`}
                    style={{ backgroundColor: note.color }}
                    onClick={() => handleNoteClick(note.key)}
                  >
                    {note.label}
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* 選択された音の表示（正解時は大きく表示） */}
          {selectedNotes.length > 0 && (
            <div className={`selected-notes ${selectedNotes.length >= 3 && isCorrect ? 'selected-notes--correct' : ''}`}>
              <p>selected: </p>
              <div className="selected-notes-list">
                {getSortedSelectedNotes().map((key) => {
                  const note = notes.find(n => n.key === key)
                  if (!note) return null
                  
                  // コードの表記に合わせて表示ラベルを変換
                  let displayLabel = note.label
                  if (note.label.includes('/')) {
                    // 'A#/Bb' 形式の場合
                    if (isFlatNotation(currentChord)) {
                      // フラット表記のコードの時は、フラット表記部分を取得
                      displayLabel = note.label.split('/')[1] // 'A#/Bb' → 'Bb'
                    } else {
                      // シャープ表記のコードの時は、シャープ表記部分を取得
                      displayLabel = note.label.split('/')[0] // 'A#/Bb' → 'A#'
                    }
                  } else if (isFlatNotation(currentChord)) {
                    // 単一の音名で、フラット表記のコードの場合、フラット表記に変換
                    displayLabel = sharpToFlat(key)
                  }
                  
                  return (
                    <div
                      key={key}
                      className="selected-note-badge"
                      style={{ backgroundColor: note.color }}
                    >
                      {displayLabel}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 正解判定の結果表示（学習ポイント：条件付きレンダリングとスタイルの動的適用） */}
          {selectedNotes.length >= 3 && (
            <div className={`answer-result ${isCorrect ? 'correct' : 'incorrect'}`}>
              {isCorrect ? (
                <div className="result-message correct-message">
                  <span className="result-icon">✓</span>
                  <span>correct!</span>
                </div>
              ) : (
                <div className="result-message incorrect-message">
                  <span className="result-icon">✗</span>
                  <span>incorrect. try again.</span>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  )
}

export default App
