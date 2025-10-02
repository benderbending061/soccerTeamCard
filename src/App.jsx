import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDoc,
  query,
  orderBy
} from 'firebase/firestore';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [players, setPlayers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    position: '',
    photo: '',
    goals: 0,
    assists: 0,
    hustlePoints: 0,
    superpower: '',
    favoriteMove: ''
  });

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Listen to players collection
  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, 'players'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(playerList);
    });
    
    return unsubscribe;
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

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

  const handleSubmit = async () => {
    if (!formData.name) {
      alert('Please enter a player name');
      return;
    }

    try {
      if (editingPlayer) {
        await updateDoc(doc(db, 'players', editingPlayer.id), formData);
      } else {
        await addDoc(collection(db, 'players'), formData);
      }
      resetForm();
    } catch (err) {
      alert('Error saving player: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      number: '',
      position: '',
      photo: '',
      goals: 0,
      assists: 0,
      hustlePoints: 0,
      superpower: '',
      favoriteMove: ''
    });
    setShowForm(false);
    setEditingPlayer(null);
  };

  const editPlayer = (player) => {
    setFormData(player);
    setEditingPlayer(player);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deletePlayer = async (playerId, playerName) => {
    if (window.confirm(`Delete ${playerName}?`)) {
      try {
        await deleteDoc(doc(db, 'players', playerId));
      } catch (err) {
        alert('Error deleting player: ' + err.message);
      }
    }
  };

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
          <h1 style={styles.loginTitle}>⚽ Soccer Team Cards</h1>
          <p style={styles.loginSubtitle}>Secure Login</p>
          <form onSubmit={handleLogin} style={styles.loginForm}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.loginButton}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isCoach = userRole === 'coach';

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>⚽ Team Player Cards</h1>
          <div style={styles.headerRight}>
            <span style={styles.roleLabel}>{isCoach ? '🏆 Coach' : '👪 Parent'}</span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {isCoach && !showForm && (
          <div style={styles.addButtonContainer}>
            <button onClick={() => setShowForm(true)} style={styles.addButton}>
              ➕ Add Player
            </button>
          </div>
        )}

        {isCoach && showForm && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h2>{editingPlayer ? '✏️ Edit Player' : '➕ New Player'}</h2>
                <button onClick={resetForm} style={styles.closeButton}>✕</button>
              </div>
              <div style={styles.formBody}>
                <input
                  type="text"
                  name="name"
                  placeholder="Player Name *"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={styles.input}
                />
                <div style={styles.row}>
                  <input
                    type="text"
                    name="number"
                    placeholder="Jersey #"
                    value={formData.number}
                    onChange={handleInputChange}
                    style={styles.inputHalf}
                  />
                  <input
                    type="text"
                    name="position"
                    placeholder="Position"
                    value={formData.position}
                    onChange={handleInputChange}
                    style={styles.inputHalf}
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={styles.fileInput}
                />
                {formData.photo && (
                  <img src={formData.photo} alt="Preview" style={styles.photoPreview} />
                )}
                <div style={styles.statsRow}>
                  <div>
                    <label style={styles.label}>Goals</label>
                    <input
                      type="number"
                      name="goals"
                      value={formData.goals}
                      onChange={handleInputChange}
                      style={styles.statInput}
                      min="0"
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Assists</label>
                    <input
                      type="number"
                      name="assists"
                      value={formData.assists}
                      onChange={handleInputChange}
                      style={styles.statInput}
                      min="0"
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Hustle</label>
                    <input
                      type="number"
                      name="hustlePoints"
                      value={formData.hustlePoints}
                      onChange={handleInputChange}
                      style={styles.statInput}
                      min="0"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  name="superpower"
                  placeholder="⚡ Superpower"
                  value={formData.superpower}
                  onChange={handleInputChange}
                  style={styles.input}
                />
                <input
                  type="text"
                  name="favoriteMove"
                  placeholder="🎯 Signature Move"
                  value={formData.favoriteMove}
                  onChange={handleInputChange}
                  style={styles.input}
                />
                <div style={styles.buttonRow}>
                  <button onClick={handleSubmit} style={styles.saveButton}>
                    {editingPlayer ? 'Update' : 'Create Card'}
                  </button>
                  <button onClick={resetForm} style={styles.cancelButton}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={styles.grid}>
          {players.map(player => (
            <div key={player.id} style={styles.card}>
              <div style={styles.cardStripe} />
              <div style={styles.cardContent}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.playerName}>{player.name}</h3>
                    <p style={styles.position}>{player.position || 'Player'}</p>
                  </div>
                  {player.number && (
                    <div style={styles.number}>#{player.number}</div>
                  )}
                </div>
                {player.photo && (
                  <img src={player.photo} alt={player.name} style={styles.playerPhoto} />
                )}
                <div style={styles.stats}>
                  <div style={styles.statRow}>
                    <span>Goals</span>
                    <span style={styles.statValue}>{player.goals}</span>
                  </div>
                  <div style={styles.statRow}>
                    <span>Assists</span>
                    <span style={styles.statValue}>{player.assists}</span>
                  </div>
                  <div style={styles.statRow}>
                    <span>Hustle Points</span>
                    <span style={styles.statValue}>{player.hustlePoints}</span>
                  </div>
                </div>
                {player.superpower && (
                  <div style={styles.superpower}>
                    <small>SUPERPOWER</small>
                    <p>{player.superpower}</p>
                  </div>
                )}
                {player.favoriteMove && (
                  <div style={styles.move}>
                    <small>SIGNATURE MOVE</small>
                    <p>{player.favoriteMove}</p>
                  </div>
                )}
                {isCoach && (
                  <div style={styles.actions}>
                    <button onClick={() => editPlayer(player)} style={styles.editButton}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => deletePlayer(player.id, player.name)} style={styles.deleteButton}>
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {players.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>⚽</div>
            <p>No players yet!</p>
            {isCoach && <p>Click "Add Player" to create your first card</p>}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontSize: '24px',
    color: '#fff',
  },
  spinner: {
    fontSize: '48px',
    animation: 'spin 2s linear infinite',
  },
  loginContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
    padding: '20px',
  },
  loginBox: {
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxWidth: '400px',
    width: '100%',
  },
  loginTitle: {
    textAlign: 'center',
    marginBottom: '8px',
    color: '#1f2937',
  },
  loginSubtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: '24px',
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    width: '100%',
  },
  inputHalf: {
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    width: '48%',
  },
  loginButton: {
    padding: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  error: {
    color: '#dc2626',
    fontSize: '14px',
    textAlign: 'center',
  },
  header: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerTitle: {
    color: 'white',
    fontSize: '24px',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  roleLabel: {
    background: 'rgba(255,255,255,0.2)',
    padding: '8px 16px',
    borderRadius: '20px',
    color: 'white',
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px',
  },
  addButtonContainer: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  addButton: {
    padding: '16px 32px',
    fontSize: '18px',
    fontWeight: 'bold',
    background: '#fbbf24',
    color: '#1f2937',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 100,
    overflowY: 'auto',
  },
  modalContent: {
    background: 'white',
    borderRadius: '16px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    padding: '20px',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
  },
  formBody: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  fileInput: {
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
  },
  photoPreview: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '4px solid #fbbf24',
    margin: '0 auto',
    display: 'block',
  },
  statsRow: {
    display: 'flex',
    gap: '12px',
    background: '#f3f4f6',
    padding: '16px',
    borderRadius: '8px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '4px',
    color: '#6b7280',
  },
  statInput: {
    width: '100%',
    padding: '8px',
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  saveButton: {
    flex: 1,
    padding: '14px',
    fontSize: '16px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    background: '#e5e7eb',
    color: '#1f2937',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },
  card: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    transition: 'transform 0.2s',
  },
  cardStripe: {
    height: '8px',
    background: 'linear-gradient(90deg, #fbbf24 0%, #f97316 100%)',
  },
  cardContent: {
    padding: '24px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '16px',
  },
  playerName: {
    color: 'white',
    fontSize: '24px',
    marginBottom: '4px',
  },
  position: {
    color: '#fbbf24',
    fontWeight: 'bold',
  },
  number: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.2)',
    lineHeight: 1,
  },
  playerPhoto: {
    width: '160px',
    height: '160px',
    objectFit: 'cover',
    borderRadius: '12px',
    border: '4px solid #fbbf24',
    margin: '0 auto 16px',
    display: 'block',
  },
  stats: {
    background: 'rgba(255,255,255,0.1)',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '12px',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#d1d5db',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  statValue: {
    color: '#fbbf24',
    fontWeight: 'bold',
    fontSize: '20px',
  },
  superpower: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '8px',
    color: 'white',
  },
  move: {
    background: 'rgba(37, 99, 235, 0.3)',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '12px',
    color: 'white',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    flex: 1,
    padding: '12px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: '12px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 20px',
    color: 'white',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
};

export default App;
