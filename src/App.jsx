import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Star, Trophy, Crown, Zap, Bell, UserPlus, UserMinus } from 'lucide-react';

// Import your Firebase (UNCOMMENT these when ready for production)
// import { auth, db } from './firebase';
// import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
// import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDoc, query, where, orderBy } from 'firebase/firestore';

export default function IntegratedSoccerApp() {
  // ==================== STATE ====================
  
  // Auth State
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Navigation
  const [view, setView] = useState('cards');
  
  // Players State
  const [players, setPlayers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    position: 'FW',
    photo: '',
    overall: 75,
    pace: 70,
    shooting: 70,
    passing: 70,
    dribbling: 70,
    defending: 70,
    physical: 70,
    teamName: '',
    favoriteMove: '',
    cardType: 'auto',
    parentUserIds: [],
    goals: 0,
    assists: 0,
    gamesPlayed: 0,
    badges: [],
    currentChallenge: null
  });
  
  // Parent Management
  const [parentEmail, setParentEmail] = useState('');
  const [parentEmails, setParentEmails] = useState([]);
  
  // Challenges State
  const [challenges] = useState([
    {
      id: 1,
      title: 'Hat Trick Hunter',
      description: 'Score 3 goals this week',
      type: 'goals',
      target: 3,
      reward: '+5 Shooting',
      active: true,
      endDate: '2025-10-09'
    },
    {
      id: 2,
      title: 'Assist Master',
      description: 'Get 5 assists this month',
      type: 'assists',
      target: 5,
      reward: '+5 Passing & POTW Card',
      active: true,
      endDate: '2025-10-31'
    }
  ]);

  // Badge Definitions
  const badges = {
    first_goal: { name: 'First Goal', icon: '⚽', color: '#10b981' },
    hat_trick: { name: 'Hat Trick Hero', icon: '🎯', color: '#f59e0b' },
    assist_king: { name: 'Assist King', icon: '👑', color: '#8b5cf6' },
    speed_demon: { name: 'Speed Demon', icon: '⚡', color: '#ef4444' },
    iron_wall: { name: 'Iron Wall', icon: '🛡️', color: '#3b82f6' },
    golden_boot: { name: 'Golden Boot', icon: '👢', color: '#fbbf24' },
    perfect_attendance: { name: 'Perfect Attendance', icon: '✅', color: '#14b8a6' },
    team_player: { name: 'Team Player', icon: '🤝', color: '#ec4899' }
  };
  // ==================== AUTHENTICATION ====================
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // PRODUCTION: Uncomment this
      // await signInWithEmailAndPassword(auth, email, password);
      
      // DEMO MODE - Remove this in production
      alert('DEMO MODE: In production, this connects to Firebase Authentication');
      setUser({ uid: 'demo-coach-id', email });
      setUserRole('coach');
      setUserName('Coach Demo');
      
      // Load demo data
      setPlayers([{
        id: Date.now(),
        name: 'Jake Smith',
        number: '10',
        position: 'FW',
        photo: '',
        overall: 78,
        pace: 82,
        shooting: 75,
        passing: 70,
        dribbling: 80,
        defending: 65,
        physical: 72,
        teamName: 'Lightning FC',
        favoriteMove: 'Step-over',
        cardType: 'silver',
        parentUserIds: [],
        goals: 8,
        assists: 5,
        gamesPlayed: 12,
        badges: ['first_goal', 'hat_trick'],
        currentChallenge: { id: 1, progress: 2, target: 3 }
      }]);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    // signOut(auth);
    setUser(null);
    setUserRole(null);
    setUserName('');
    setPlayers([]);
  };

  // PRODUCTION: Uncomment this to enable real-time auth
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
  //     setUser(currentUser);
  //     if (currentUser) {
  //       const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
  //       if (userDoc.exists()) {
  //         setUserRole(userDoc.data().role);
  //         setUserName(userDoc.data().name);
  //       }
  //     } else {
  //       setUserRole(null);
  //     }
  //     setLoading(false);
  //   });
  //   return unsubscribe;
  // }, []);

  // PRODUCTION: Uncomment to enable real-time player sync with parent filtering
  // useEffect(() => {
  //   if (!user) return;
  //   
  //   let q;
  //   if (userRole === 'coach') {
  //     q = query(collection(db, 'players'), orderBy('name'));
  //   } else {
  //     q = query(
  //       collection(db, 'players'),
  //       where('parentUserIds', 'array-contains', user.uid)
  //     );
  //   }
  //   
  //   const unsubscribe = onSnapshot(q, (snapshot) => {
  //     const playerList = snapshot.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data()
  //     }));
  //     setPlayers(playerList);
  //   });
  //   
  //   return unsubscribe;
  // }, [user, userRole]);

  // ==================== PLAYER MANAGEMENT ====================
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addParentEmail = () => {
    if (!parentEmail) {
      alert('Please enter a parent email');
      return;
    }
    if (!parentEmail.includes('@')) {
      alert('Please enter a valid email');
      return;
    }
    if (parentEmails.includes(parentEmail)) {
      alert('This parent is already added');
      return;
    }
    setParentEmails([...parentEmails, parentEmail]);
    setParentEmail('');
  };

  const removeParentEmail = (emailToRemove) => {
    setParentEmails(parentEmails.filter(e => e !== emailToRemove));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      alert('Please enter a player name');
      return;
    }

    // PRODUCTION: Convert parent emails to UIDs
    // const parentUserIds = await convertEmailsToUIDs(parentEmails);
    const parentUserIds = parentEmails; // DEMO
    
    const playerData = {
      ...formData,
      parentUserIds,
      badges: formData.badges || [],
      goals: formData.goals || 0,
      assists: formData.assists || 0,
      gamesPlayed: formData.gamesPlayed || 0
    };

    try {
      if (editingPlayer !== null) {
        // PRODUCTION: await updateDoc(doc(db, 'players', players[editingPlayer].id), playerData);
        const updated = [...players];
        updated[editingPlayer] = { ...playerData, id: players[editingPlayer].id };
        setPlayers(updated);
      } else {
        // PRODUCTION: await addDoc(collection(db, 'players'), playerData);
        setPlayers([...players, { ...playerData, id: Date.now() }]);
      }
      
      // PRODUCTION: Send notification to parents
      // await sendParentNotification(parentUserIds, `New card created for ${formData.name}!`);
      
      resetForm();
    } catch (err) {
      alert('Error saving player: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      number: '',
      position: 'FW',
      photo: '',
      overall: 75,
      pace: 70,
      shooting: 70,
      passing: 70,
      dribbling: 70,
      defending: 70,
      physical: 70,
      teamName: '',
      favoriteMove: '',
      cardType: 'auto',
      parentUserIds: [],
      goals: 0,
      assists: 0,
      gamesPlayed: 0,
      badges: [],
      currentChallenge: null
    });
    setParentEmails([]);
    setShowForm(false);
    setEditingPlayer(null);
  };

  const editPlayer = (index) => {
    const player = players[index];
    setFormData(player);
    setParentEmails(player.parentUserIds || []);
    setEditingPlayer(index);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deletePlayer = async (index) => {
    if (confirm(`Delete ${players[index].name}?`)) {
      try {
        // PRODUCTION: await deleteDoc(doc(db, 'players', players[index].id));
        setPlayers(players.filter((_, i) => i !== index));
      } catch (err) {
        alert('Error deleting player: ' + err.message);
      }
    }
  };
  // ==================== RENDER ====================
  
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}>⚽</div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginBox}>
          <h1 style={styles.loginTitle}>⚽ Ultimate Team Cards</h1>
          <p style={styles.loginSubtitle}>🔒 Secure Login • Coach & Parent Access</p>
          <div style={styles.loginForm}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            {error && <p style={styles.error}>{error}</p>}
            <button onClick={handleLogin} style={styles.loginButton}>
              Sign In
            </button>
          </div>
          <p style={styles.demoNote}>
            🔒 DEMO MODE: In production, connects to Firebase Authentication
          </p>
        </div>
      </div>
    );
  }

  const isCoach = userRole === 'coach';

  return (
    <div style={styles.app}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerTop}>
            <h1 style={styles.headerTitle}>⚽ Ultimate Team Platform</h1>
            <div style={styles.headerRight}>
              <span style={styles.userName}>{userName}</span>
              <span style={styles.roleLabel}>{isCoach ? '🏆 Coach' : '👪 Parent'}</span>
              <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
            </div>
          </div>
          
          {isCoach && (
            <div style={styles.nav}>
              <button onClick={() => setView('cards')} style={{...styles.navButton, ...(view === 'cards' ? styles.navButtonActive : {})}}>
                Player Cards
              </button>
              <button onClick={() => setView('quickEntry')} style={{...styles.navButton, ...(view === 'quickEntry' ? styles.navButtonActive : {})}}>
                ⚡ Quick Stats
              </button>
              <button onClick={() => setView('challenges')} style={{...styles.navButton, ...(view === 'challenges' ? styles.navButtonActive : {})}}>
                🎯 Challenges
              </button>
              <button onClick={() => setView('awards')} style={{...styles.navButton, ...(view === 'awards' ? styles.navButtonActive : {})}}>
                🏆 Awards
              </button>
            </div>
          )}
        </div>
      </header>

      <main style={styles.main}>
        {/* PLAYER CARDS VIEW */}
        {view === 'cards' && (
          <div>
            {isCoach && (
              <div style={styles.viewHeader}>
                <div>
                  <h2 style={styles.viewTitle}>Player Cards</h2>
                  <p style={styles.viewSubtitle}>Complete roster with badges and progress</p>
                </div>
                <button onClick={() => setShowForm(true)} style={styles.addButton}>
                  <Plus size={20} />
                  Add Player
                </button>
              </div>
            )}
            
            {!isCoach && (
              <div style={styles.parentHeader}>
                <h2 style={styles.parentTitle}>Your Player{players.length > 1 ? 's' : ''}</h2>
                <p style={styles.parentSubtitle}>Updates in real-time after each game!</p>
              </div>
            )}
            
            <div style={styles.grid}>
              {players.map((player, index) => {
                const cardColors = getCardColors(player.cardType, player.overall);
                const IconComponent = cardColors.icon;
                
                return (
                  <div key={player.id} style={{ width: '280px' }}>
                    {/* FIFA CARD */}
                    <div style={{
                      ...styles.card,
                      background: cardColors.bg,
                      boxShadow: `0 10px 40px ${cardColors.glow}`,
                      border: `3px solid ${cardColors.glow}`
                    }}>
                      {IconComponent && (
                        <div style={styles.cardBadge}>
                          <IconComponent size={14} />
                        </div>
                      )}

                      <div style={{ ...styles.cardRating, color: cardColors.text }}>
                        <div style={{ fontSize: '52px', fontWeight: '900', lineHeight: '1' }}>
                          {player.overall}
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                          {getPositionLabel(player.position)}
                        </div>
                      </div>

                      {player.photo ? (
                        <div style={styles.cardPhoto}>
                          <img src={player.photo} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div style={{ ...styles.cardPhoto, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px' }}>
                          ⚽
                        </div>
                      )}

                      <div style={{ ...styles.cardName, color: cardColors.text }}>
                        {player.name}
                      </div>

                      <div style={{ ...styles.cardStats, color: cardColors.text }}>
                        <div style={styles.statRow}><span>{player.pace}</span><span style={{ fontSize: '13px' }}>PAC</span></div>
                        <div style={styles.statRow}><span>{player.dribbling}</span><span style={{ fontSize: '13px' }}>DRI</span></div>
                        <div style={styles.statRow}><span>{player.shooting}</span><span style={{ fontSize: '13px' }}>SHO</span></div>
                        <div style={styles.statRow}><span>{player.defending}</span><span style={{ fontSize: '13px' }}>DEF</span></div>
                        <div style={styles.statRow}><span>{player.passing}</span><span style={{ fontSize: '13px' }}>PAS</span></div>
                        <div style={styles.statRow}><span>{player.physical}</span><span style={{ fontSize: '13px' }}>PHY</span></div>
                      </div>
                    </div>

                    {/* BADGES */}
                    {player.badges && player.badges.length > 0 && (
                      <div style={styles.badgesContainer}>
                        {player.badges.slice(0, 4).map(badgeId => {
                          const badge = badges[badgeId];
                          return badge ? (
                            <div key={badgeId} style={{ ...styles.badge, background: badge.color }} title={badge.name}>
                              {badge.icon}
                            </div>
                          ) : null;
                        })}
                        {player.badges.length > 4 && (
                          <div style={{ ...styles.badge, background: '#6b7280' }}>
                            +{player.badges.length - 4}
                          </div>
                        )}
                      </div>
                    )}

                    {/* CHALLENGE PROGRESS */}
                    {player.currentChallenge && (
                      <div style={styles.challengeProgress}>
                        <div style={styles.challengeText}>
                          🎯 Challenge: {player.currentChallenge.progress}/{player.currentChallenge.target}
                        </div>
                        <div style={styles.progressBar}>
                          <div style={{ 
                            ...styles.progressFill, 
                            width: `${(player.currentChallenge.progress / player.currentChallenge.target) * 100}%` 
                          }} />
                        </div>
                      </div>
                    )}

                    {/* SEASON STATS */}
                    <div style={styles.seasonStats}>
                      <span>⚽ {player.goals || 0} Goals</span>
                      <span>🎯 {player.assists || 0} Assists</span>
                    </div>

                    {/* COACH ACTIONS */}
                    {isCoach && (
                      <>
                        <div style={styles.actions}>
                          <button onClick={() => editPlayer(index)} style={styles.editButton}>
                            ✏️ Edit
                          </button>
                          <button onClick={() => deletePlayer(index)} style={styles.deleteButton}>
                            🗑️
                          </button>
                        </div>
                        
                        {player.parentUserIds && player.parentUserIds.length > 0 && (
                          <div style={styles.parentCount}>
                            👪 {player.parentUserIds.length} parent(s) have access
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {players.length === 0 && (
              <div style={styles.empty}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚽</div>
                <p style={{ fontSize: '24px', marginBottom: '8px', fontWeight: 'bold' }}>
                  {isCoach ? 'Build Your Ultimate Team!' : 'No Player Cards Available'}
                </p>
                <p style={{ color: '#c084fc' }}>
                  {isCoach ? 'Create your first player card' : 'Contact your coach for access'}
                </p>
              </div>
            )}
          </div>
        )}
        {/* QUICK STAT ENTRY - COACH ONLY */}
        {isCoach && view === 'quickEntry' && (
          <div>
            <div style={styles.viewHeader}>
              <div>
                <h2 style={styles.viewTitle}>⚡ Quick Stat Entry</h2>
                <p style={styles.viewSubtitle}>Tap buttons during games - automatic badge awards!</p>
              </div>
            </div>

            <div style={styles.quickEntryGrid}>
              {players.map(player => (
                <div key={player.id} style={styles.quickEntryCard}>
                  <div style={styles.quickEntryHeader}>
                    <div>
                      <div style={styles.quickEntryName}>{player.name}</div>
                      <div style={styles.quickEntryPosition}>#{player.number} • {player.position}</div>
                    </div>
                    <div style={styles.quickEntryPhoto}>
                      {player.photo ? (
                        <img src={player.photo} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                      ) : (
                        <div style={{ fontSize: '24px' }}>⚽</div>
                      )}
                    </div>
                  </div>

                  <div style={styles.quickEntryStats}>
                    <div style={styles.quickStat}>
                      <span style={styles.quickStatLabel}>Goals</span>
                      <div style={styles.quickStatControls}>
                        <button onClick={() => quickAddGoal(player.id)} style={styles.quickStatButton}>
                          +1
                        </button>
                        <span style={styles.quickStatValue}>{player.goals || 0}</span>
                      </div>
                    </div>

                    <div style={styles.quickStat}>
                      <span style={styles.quickStatLabel}>Assists</span>
                      <div style={styles.quickStatControls}>
                        <button onClick={() => quickAddAssist(player.id)} style={styles.quickStatButton}>
                          +1
                        </button>
                        <span style={styles.quickStatValue}>{player.assists || 0}</span>
                      </div>
                    </div>
                  </div>

                  {player.badges && player.badges.length > 0 && (
                    <div style={styles.quickEntryBadges}>
                      🏅 {player.badges.length} badge(s) earned!
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHALLENGES - COACH ONLY */}
        {isCoach && view === 'challenges' && (
          <div>
            <div style={styles.viewHeader}>
              <div>
                <h2 style={styles.viewTitle}>🎯 Weekly Challenges</h2>
                <p style={styles.viewSubtitle}>Keep players motivated with goals and rewards</p>
              </div>
            </div>

            <div style={styles.challengesGrid}>
              {challenges.map(challenge => (
                <div key={challenge.id} style={styles.challengeCard}>
                  <div style={styles.challengeHeader}>
                    <h3 style={styles.challengeTitle}>{challenge.title}</h3>
                    <span style={styles.challengeBadge}>Active</span>
                  </div>
                  <p style={styles.challengeDescription}>{challenge.description}</p>
                  <div style={styles.challengeReward}>
                    <Trophy size={16} />
                    <span>Reward: {challenge.reward}</span>
                  </div>
                  <div style={styles.challengeFooter}>
                    <span style={styles.challengeDate}>Ends: {challenge.endDate}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.infoBox}>
              <h3 style={styles.infoTitle}>💡 How Challenges Work</h3>
              <ul style={styles.infoList}>
                <li>Assign challenges to individual players or whole team</li>
                <li>Progress updates automatically as you add stats</li>
                <li>When completed: auto stat boost + special card upgrade</li>
                <li>Parents get notified when their kid completes a challenge</li>
              </ul>
            </div>
          </div>
        )}

        {/* AWARDS - COACH ONLY */}
        {isCoach && view === 'awards' && (
          <div>
            <div style={styles.viewHeader}>
              <div>
                <h2 style={styles.viewTitle}>🏆 Season Awards</h2>
                <p style={styles.viewSubtitle}>End of season recognition</p>
              </div>
            </div>

            <div style={styles.awardsGrid}>
              {getSeasonAwards().map((award, index) => (
                <div key={index} style={styles.awardCard}>
                  <div style={styles.awardIcon}>{award.award.split(' ')[0]}</div>
                  <h3 style={styles.awardTitle}>{award.award.split(' ').slice(1).join(' ')}</h3>
                  <div style={styles.awardWinner}>
                    <div style={styles.awardWinnerPhoto}>
                      {award.player.photo ? (
                        <img src={award.player.photo} alt={award.player.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      ) : (
                        <div style={{ fontSize: '32px' }}>⚽</div>
                      )}
                    </div>
                    <div style={styles.awardWinnerName}>{award.player.name}</div>
                    <div style={styles.awardStat}>{award.stat}</div>
                  </div>
                  <button style={styles.awardButton}>
                    📜 Print Certificate
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.badgesSection}>
              <h3 style={styles.sectionTitle}>🏅 All Available Badges</h3>
              <div style={styles.allBadgesGrid}>
                {Object.entries(badges).map(([id, badge]) => (
                  <div key={id} style={{ ...styles.badgeCard, borderColor: badge.color }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{badge.icon}</div>
                    <div style={styles.badgeName}>{badge.name}</div>
                    <div style={styles.badgeCount}>
                      {players.filter(p => p.badges?.includes(id)).length} earned
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      {/* PLAYER FORM MODAL - COACH ONLY */}
      {isCoach && showForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2>{editingPlayer !== null ? '✏️ Edit Card' : '➕ Create New Card'}</h2>
              <button onClick={resetForm} style={styles.closeButton}>
                <X size={24} />
              </button>
            </div>
            
            <div style={styles.formBody}>
              {/* Player Info */}
              <div>
                <label style={styles.label}>Player Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} style={styles.input} placeholder="Jake Smith" />
              </div>

              <div style={styles.row}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Jersey #</label>
                  <input type="text" name="number" value={formData.number} onChange={handleInputChange} style={styles.input} placeholder="10" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Position</label>
                  <select name="position" value={formData.position} onChange={handleInputChange} style={styles.input}>
                    <option value="GK">Goalkeeper</option>
                    <option value="DEF">Defender</option>
                    <option value="MID">Midfielder</option>
                    <option value="FW">Forward</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={styles.label}>Team Name</label>
                <input type="text" name="teamName" value={formData.teamName} onChange={handleInputChange} style={styles.input} placeholder="Lightning FC" />
              </div>

              <div>
                <label style={styles.label}>Card Type</label>
                <select name="cardType" value={formData.cardType} onChange={handleInputChange} style={styles.input}>
                  <option value="auto">Auto (By Rating)</option>
                  <option value="bronze">🥉 Bronze</option>
                  <option value="silver">🥈 Silver</option>
                  <option value="gold">🥇 Gold</option>
                  <option value="captain">👑 Captain</option>
                  <option value="potw">⭐ POTW</option>
                  <option value="mvp">🏆 MVP</option>
                  <option value="legend">⚡ Legend</option>
                </select>
              </div>

              {/* Photo */}
              <div>
                <label style={styles.label}>Player Photo</label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={styles.fileInput} />
                {formData.photo && <img src={formData.photo} alt="Preview" style={styles.photoPreview} />}
              </div>

              {/* Stats */}
              <div style={styles.statsBox}>
                <h3 style={styles.statsTitle}>⭐ Player Stats</h3>
                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.label}>Overall Rating</label>
                  <input type="number" name="overall" value={formData.overall} onChange={handleInputChange} min="1" max="99" style={styles.statInputLarge} />
                </div>
                <div style={styles.statsGrid}>
                  <div><label style={styles.labelSmall}>PAC</label><input type="number" name="pace" value={formData.pace} onChange={handleInputChange} min="1" max="99" style={styles.statInput} /></div>
                  <div><label style={styles.labelSmall}>SHO</label><input type="number" name="shooting" value={formData.shooting} onChange={handleInputChange} min="1" max="99" style={styles.statInput} /></div>
                  <div><label style={styles.labelSmall}>PAS</label><input type="number" name="passing" value={formData.passing} onChange={handleInputChange} min="1" max="99" style={styles.statInput} /></div>
                  <div><label style={styles.labelSmall}>DRI</label><input type="number" name="dribbling" value={formData.dribbling} onChange={handleInputChange} min="1" max="99" style={styles.statInput} /></div>
                  <div><label style={styles.labelSmall}>DEF</label><input type="number" name="defending" value={formData.defending} onChange={handleInputChange} min="1" max="99" style={styles.statInput} /></div>
                  <div><label style={styles.labelSmall}>PHY</label><input type="number" name="physical" value={formData.physical} onChange={handleInputChange} min="1" max="99" style={styles.statInput} /></div>
                </div>
              </div>

              <div>
                <label style={styles.label}>🎯 Signature Move</label>
                <input type="text" name="favoriteMove" value={formData.favoriteMove} onChange={handleInputChange} style={styles.input} placeholder="Step-over" />
              </div>

              {/* PARENT ACCESS */}
              <div style={styles.parentAccessBox}>
                <h3 style={styles.parentAccessTitle}>👪 Parent Access (Secure)</h3>
                <p style={styles.parentAccessDesc}>Add parent emails - only they will see this card</p>
                
                <div style={styles.parentInputRow}>
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="parent@email.com"
                    style={{ ...styles.input, flex: 1, marginBottom: 0 }}
                  />
                  <button onClick={addParentEmail} style={styles.addParentButton}>
                    <UserPlus size={18} />
                    Add
                  </button>
                </div>

                {parentEmails.length > 0 && (
                  <div style={styles.parentList}>
                    {parentEmails.map((email, index) => (
                      <div key={index} style={styles.parentItem}>
                        <span style={styles.parentEmail}>✓ {email}</span>
                        <button onClick={() => removeParentEmail(email)} style={styles.removeParentButton}>
                          <UserMinus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {parentEmails.length === 0 && (
                  <p style={styles.noParents}>No parents added. Only coach can see this card.</p>
                )}
              </div>

              {/* Actions */}
              <div style={styles.buttonRow}>
                <button onClick={handleSubmit} style={styles.saveButton}>
                  {editingPlayer !== null ? 'Update Card' : 'Create Card'}
                </button>
                <button onClick={resetForm} style={styles.cancelButton}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION BELL */}
      <div style={styles.notificationIndicator} title="Parent notifications enabled">
        <Bell size={20} />
        <span style={styles.notificationBadge}>3</span>
      </div>
    </div>
  );
}
// ==================== STYLES ====================

const styles = {
  app: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '24px', color: '#fff' },
  spinner: { fontSize: '48px' },
  loginContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', padding: '20px' },
  loginBox: { background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '40px', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', maxWidth: '400px', width: '100%', border: '2px solid rgba(139, 92, 246, 0.3)' },
  loginTitle: { textAlign: 'center', marginBottom: '8px', color: 'white', background: 'linear-gradient(135deg, #fbbf24, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  loginSubtitle: { textAlign: 'center', color: '#a78bfa', marginBottom: '24px', fontSize: '14px' },
  loginForm: { display: 'flex', flexDirection: 'column', gap: '16px' },
  loginButton: { padding: '12px', fontSize: '16px', fontWeight: 'bold', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  demoNote: { marginTop: '16px', fontSize: '12px', color: '#a78bfa', textAlign: 'center', lineHeight: '1.5' },
  error: { color: '#ef4444', fontSize: '14px', textAlign: 'center' },
  header: { background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', borderBottom: '2px solid rgba(139, 92, 246, 0.3)', position: 'sticky', top: 0, zIndex: 10 },
  headerContent: { maxWidth: '1400px', margin: '0 auto', padding: '16px' },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
  headerTitle: { color: 'white', fontSize: '24px', margin: 0 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  userName: { color: 'white', fontSize: '14px' },
  roleLabel: { background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', padding: '8px 16px', borderRadius: '20px', color: 'white', fontWeight: 'bold', fontSize: '14px' },
  logoutButton: { padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  nav: { display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' },
  navButton: { padding: '10px 20px', background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.2s' },
  navButtonActive: { background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', border: '1px solid transparent' },
  main: { maxWidth: '1400px', margin: '0 auto', padding: '24px', paddingBottom: '100px' },
  viewHeader: { marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' },
  viewTitle: { color: 'white', fontSize: '32px', margin: 0 },
  viewSubtitle: { color: '#a78bfa', fontSize: '15px', marginTop: '8px' },
  addButton: { padding: '12px 24px', background: 'linear-gradient(135deg, #fbbf24, #f97316)', color: '#1a1a1a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' },
  parentHeader: { marginBottom: '32px', textAlign: 'center' },
  parentTitle: { color: 'white', fontSize: '32px', margin: 0, marginBottom: '8px' },
  parentSubtitle: { color: '#a78bfa', fontSize: '15px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', justifyItems: 'center' },
  card: { borderRadius: '20px', padding: '20px', position: 'relative', height: '420px' },
  cardBadge: { position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', padding: '4px 12px', borderRadius: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' },
  cardRating: { position: 'absolute', top: '25px', left: '25px', textAlign: 'center' },
  cardPhoto: { position: 'absolute', top: '90px', left: '50%', transform: 'translateX(-50%)', width: '180px', height: '180px', overflow: 'hidden' },
  cardName: { position: 'absolute', bottom: '105px', left: '0', right: '0', textAlign: 'center', padding: '0 15px', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' },
  cardStats: { position: 'absolute', bottom: '15px', left: '20px', right: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', fontSize: '16px', fontWeight: 'bold' },
  statRow: { display: 'flex', justifyContent: 'space-between' },
  badgesContainer: { display: 'flex', gap: '6px', marginTop: '12px', justifyContent: 'center' },
  badge: { width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' },
  challengeProgress: { marginTop: '12px', background: 'rgba(139, 92, 246, 0.2)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.3)' },
  challengeText: { color: '#a78bfa', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' },
  progressBar: { height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #6366f1)', transition: 'width 0.3s' },
  seasonStats: { marginTop: '12px', display: 'flex', justifyContent: 'space-around', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: 'bold' },
  actions: { display: 'flex', gap: '8px', marginTop: '12px' },
  editButton: { flex: 1, padding: '10px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  deleteButton: { padding: '10px 16px', background: 'linear-gradient(135deg, #dc2626, #ef4444)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  parentCount: { marginTop: '8px', padding: '6px 12px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', textAlign: 'center', fontSize: '12px', color: '#60a5fa', fontWeight: '600' },
  quickEntryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
  quickEntryCard: { background: 'rgba(30, 41, 59, 0.8)', border: '2px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', padding: '16px' },
  quickEntryHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px' },
  quickEntryName: { color: 'white', fontSize: '18px', fontWeight: 'bold' },
  quickEntryPosition: { color: '#a78bfa', fontSize: '13px', marginTop: '4px' },
  quickEntryPhoto: { width: '50px', height: '50px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  quickEntryStats: { display: 'flex', flexDirection: 'column', gap: '12px' },
  quickStat: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  quickStatLabel: { color: '#a78bfa', fontSize: '14px', fontWeight: 'bold' },
  quickStatControls: { display: 'flex', alignItems: 'center', gap: '12px' },
  quickStatButton: { padding: '8px 16px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' },
  quickStatValue: { color: 'white', fontSize: '24px', fontWeight: 'bold', minWidth: '30px', textAlign: 'center' },
  quickEntryBadges: { marginTop: '12px', padding: '8px', background: 'rgba(251, 191, 36, 0.2)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '6px', color: '#fbbf24', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' },
  challengesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginBottom: '32px' },
  challengeCard: { background: 'rgba(30, 41, 59, 0.8)', border: '2px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', padding: '20px' },
  challengeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' },
  challengeTitle: { color: 'white', fontSize: '20px', margin: 0 },
  challengeBadge: { padding: '4px 12px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  challengeDescription: { color: '#a78bfa', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' },
  challengeReward: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '8px', color: '#fbbf24', fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' },
  challengeFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  challengeDate: { color: '#6b7280', fontSize: '13px' },
  infoBox: { background: 'rgba(59, 130, 246, 0.1)', border: '2px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '20px' },
  infoTitle: { color: '#60a5fa', fontSize: '18px', marginBottom: '12px' },
  infoList: { color: '#93c5fd', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' },
  awardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' },
  awardCard: { background: 'rgba(30, 41, 59, 0.8)', border: '2px solid rgba(251, 191, 36, 0.5)', borderRadius: '12px', padding: '24px', textAlign: 'center' },
  awardIcon: { fontSize: '48px', marginBottom: '12px' },
  awardTitle: { color: '#fbbf24', fontSize: '18px', marginBottom: '20px' },
  awardWinner: { marginBottom: '20px' },
  awardWinnerPhoto: { width: '80px', height: '80px', margin: '0 auto 12px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid rgba(251, 191, 36, 0.5)' },
  awardWinnerName: { color: 'white', fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' },
  awardStat: { color: '#a78bfa', fontSize: '14px' },
  awardButton: { padding: '10px 20px', background: 'linear-gradient(135deg, #fbbf24, #f97316)', color: '#1a1a1a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
  badgesSection: { marginTop: '40px' },
  sectionTitle: { color: 'white', fontSize: '24px', marginBottom: '20px' },
  allBadgesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' },
  badgeCard: { background: 'rgba(30, 41, 59, 0.8)', border: '2px solid', borderRadius: '12px', padding: '20px', textAlign: 'center' },
  badgeName: { color: 'white', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' },
  badgeCount: { color: '#a78bfa', fontSize: '12px' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 100, overflowY: 'auto' },
  modalContent: { background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '2px solid rgba(139, 92, 246, 0.3)' },
  modalHeader: { background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', padding: '20px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' },
  closeButton: { background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' },
  formBody: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  row: { display: 'flex', gap: '16px' },
  label: { display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#a78bfa' },
  labelSmall: { display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#a78bfa', textAlign: 'center' },
  input: { padding: '12px', fontSize: '16px', border: '2px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', width: '100%', background: 'rgba(30, 41, 59, 0.5)', color: 'white' },
  fileInput: { padding: '12px', border: '2px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.5)', color: 'white' },
  photoPreview: { width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px', border: '4px solid #8b5cf6', margin: '12px auto 0', display: 'block' },
  statsBox: { background: 'rgba(139, 92, 246, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)' },
  statsTitle: { color: 'white', marginBottom: '16px', textAlign: 'center' },
  statInputLarge: { width: '100%', padding: '12px', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', border: '2px solid #fbbf24', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.5)', color: '#fbbf24' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  statInput: { width: '100%', padding: '8px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center', border: '2px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.5)', color: 'white' },
  parentAccessBox: { background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '12px', border: '2px solid rgba(59, 130, 246, 0.3)' },
  parentAccessTitle: { color: '#60a5fa', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' },
  parentAccessDesc: { color: '#93c5fd', fontSize: '13px', marginBottom: '12px', lineHeight: '1.5' },
  parentInputRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
  addParentButton: { padding: '12px 16px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' },
  parentList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  parentItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(59, 130, 246, 0.2)', padding: '10px 12px', borderRadius: '8px' },
  parentEmail: { color: 'white', fontSize: '14px', fontWeight: '500' },
  removeParentButton: { background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#ef4444', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  noParents: { color: '#93c5fd', fontSize: '13px', fontStyle: 'italic', textAlign: 'center' },
  buttonRow: { display: 'flex', gap: '12px', marginTop: '8px' },
  saveButton: { flex: 1, padding: '14px', fontSize: '16px', fontWeight: 'bold', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  cancelButton: { padding: '14px 24px', fontSize: '16px', fontWeight: 'bold', background: 'rgba(100, 116, 139, 0.3)', color: 'white', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '8px', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '80px 20px', color: 'white' },
  notificationIndicator: { position: 'fixed', bottom: '24px', right: '24px', width: '56px', height: '56px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', boxShadow: '0 10px 30px rgba(139, 92, 246, 0.5)' },
  notificationBadge: { position: 'absolute', top: '-4px', right: '-4px', width: '24px', height: '24px', background: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', border: '2px solid #0f172a' },
};
