const {connect, keyStores, KeyPair, Contract, providers} = nearApi;

// PLACEHOLDERS - User to fill these
const CONTRACT_ID = "swing-calendar.testnet";
const PRIVATE_KEY = "ed25519:45Pg6kABXnAprqQKQHkwnpkXXqbpuAk1e4oJhFuUZmnDePZTHkj3zvfVt6eJhFzZpJZjYqfHBZc3uxZoZVbpwbcs"; // Function Call Key
const NETWORK_ID = "testnet"; // or mainnet
const PUBLIC_KEY = "ed25519:AED1qyKF45bAGZu9od3SurLEDzMmYpddzYXFospDirT";

function App() {
    const [events, setEvents] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [contract, setContract] = React.useState(null);

    // Form State
    const [formData, setFormData] = React.useState({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        location: "",
        type: "Class",
        instructor: "",
        level: "Beginner"
    });

    React.useEffect(() => {
        initNear();
    }, []);

    const initNear = async () => {
        if (CONTRACT_ID === "PLACEHOLDER_CONTRACT_ID" || PRIVATE_KEY === "PLACEHOLDER_PRIVATE_KEY") {
            setError("Please set CONTRACT_ID and PRIVATE_KEY in App.jsx");
            return;
        }

        try {
            const keyStore = new keyStores.InMemoryKeyStore();
            const keyPair = KeyPair.fromString(PRIVATE_KEY);
            // We use the contract ID as the account ID for the function call key usually, 
            // or the account that owns the key. 
            // Assuming the function call key was added to the contract account itself or a specific user account.
            // For simplicity, let's assume we are acting as the account that holds the key.
            // If the key is a functional call key on the contract account, we use contract ID.
            await keyStore.setKey(NETWORK_ID, CONTRACT_ID, keyPair);

            const config = {
                networkId: NETWORK_ID,
                keyStore,
                nodeUrl: `https://rpc.${NETWORK_ID}.near.org`,
                walletUrl: `https://wallet.${NETWORK_ID}.near.org`,
                helperUrl: `https://helper.${NETWORK_ID}.near.org`,
                explorerUrl: `https://explorer.${NETWORK_ID}.near.org`,
            };

            const near = await connect(config);
            const account = await near.account(CONTRACT_ID);

            const contractInstance = new Contract(
                account,
                CONTRACT_ID,
                {
                    viewMethods: ["get_events"],
                    changeMethods: ["add_event"],
                }
            );

            setContract(contractInstance);
            fetchEvents(contractInstance);

        } catch (err) {
            console.error("Failed to init NEAR:", err);
            setError("Failed to connect to NEAR: " + err.message);
        }
    };

    const fetchEvents = async (contractInstance) => {
        if (!contractInstance) return;
        setLoading(true);
        try {
            const result = await contractInstance.get_events();
            setEvents(result);
            setError(null);
        } catch (err) {
            console.error("Error fetching events:", err);
            setError("Error fetching events: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!contract) return;
        setLoading(true);

        try {
            // Convert times to U64 (nanoseconds? or just number? Contract uses U64)
            // Contract expects U64, which in JSON is a string or number.
            // Let's assume input is a number for now or simple string.
            // If it's a timestamp, we might need to parse it.
            // For simplicity, passing as is (assuming user enters valid number)
            // or we can use Date.now() if empty.

            const payload = {
                title: formData.title,
                description: formData.description,
                start_time: formData.start_time, // String representation of U64
                end_time: formData.end_time,
                location: formData.location,
                type: formData.type,
                instructor: formData.instructor,
                level: formData.level
            };

            await contract.add_event({event: payload});

            // Clear form
            setFormData({
                title: "",
                description: "",
                start_time: "",
                end_time: "",
                location: "",
                type: "Class",
                instructor: "",
                level: "Beginner"
            });

            // Refresh events
            fetchEvents(contract);

        } catch (err) {
            console.error("Error adding event:", err);
            setError("Error adding event: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>SwingCalendar Events</h1>

            {error && <div className="error">{error}</div>}

            <div className="glass-panel">
                <h2>Add New Event</h2>
                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group full-width">
                        <label>Title</label>
                        <input name="title" value={formData.title} onChange={handleInputChange} required
                               placeholder="e.g. Salsa Night Fever"/>
                    </div>
                    <div className="form-group full-width">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} required
                                  rows="3" placeholder="Describe the event..."/>
                    </div>
                    <div className="form-group">
                        <label>Start Time (Timestamp)</label>
                        <input name="start_time" type="number" value={formData.start_time} onChange={handleInputChange}
                               required placeholder="e.g. 1678886400000"/>
                    </div>
                    <div className="form-group">
                        <label>End Time (Timestamp)</label>
                        <input name="end_time" type="number" value={formData.end_time} onChange={handleInputChange}
                               required placeholder="e.g. 1678890000000"/>
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <input name="location" value={formData.location} onChange={handleInputChange} required
                               placeholder="e.g. Downtown Studio"/>
                    </div>
                    <div className="form-group">
                        <label>Instructor</label>
                        <input name="instructor" value={formData.instructor} onChange={handleInputChange} required
                               placeholder="e.g. Jane Doe"/>
                    </div>
                    <div className="form-group">
                        <label>Type</label>
                        <select name="type" value={formData.type} onChange={handleInputChange}>
                            <option value="Class">Class</option>
                            <option value="Party">Party</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Level</label>
                        <select name="level" value={formData.level} onChange={handleInputChange}>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Teacher">Teacher</option>
                        </select>
                    </div>
                    <div className="form-group full-width">
                        <button type="submit" disabled={loading}>
                            {loading ? "Processing..." : "Add Event"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="glass-panel">
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h2 style={{margin: 0}}>Upcoming Events</h2>
                    <button className="secondary" onClick={() => fetchEvents(contract)} disabled={loading || !contract}
                            style={{width: 'auto', marginTop: 0}}>
                        Refresh
                    </button>
                </div>

                <div className="event-list">
                    {events.length === 0 ? (
                        <p style={{color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1/-1'}}>No events
                            found. Add one above!</p>
                    ) : (
                        events.map((event, index) => (
                            <div key={index} className="event-card">
                                <div className="event-meta">
                                    <span className="badge type">{event.type}</span>
                                    <span className="badge level">{event.level}</span>
                                </div>
                                <h3>{event.title}</h3>
                                <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px'}}>
                                    {new Date(Number(event.start_time)).toLocaleString()}
                                </p>
                                <p><strong>Instructor:</strong> {event.instructor}</p>
                                <p><strong>Location:</strong> {event.location}</p>
                                <p style={{marginTop: '10px', lineHeight: '1.5'}}>{event.description}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
