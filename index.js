import { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, serverTimestamp } from 'firebase/firestore';

// Context for Language (Burmese/English)
const LanguageContext = createContext();
// Context for Dark Mode
const ThemeContext = createContext();

// Language translations
const translations = {
    my: {
        appName: "လစာစုဆောင်းခြင်းအက်ပ်",
        dashboard: "ပင်မစာမျက်နှာ",
        menu: "မီနူး",
        transactionForm: "ငွေသွင်း/ထုတ် မှတ်တမ်းတင်ရန်",
        transactionHistory: "ငွေသွင်း/ထုတ် မှတ်တမ်း",
        settings: "ဆက်တင်များ",
        language: "ဘာသာစကား",
        burmese: "မြန်မာ",
        english: "အင်္ဂလိပ်",
        dateTime: "ရက်စွဲ/အချိန်",
        type: "အမျိုးအစား",
        income: "ဝင်ငွေ",
        expense: "အသုံးစရိတ်",
        category: "အမျိုးအစားခွဲ",
        categories: {
            salary: "လစာ",
            food: "အစားအသောက်",
            transport: "သယ်ယူပို့ဆောင်ရေး",
            rent: "အိမ်ငှားခ",
            utilities: "မီတာ/ရေဖိုး",
            entertainment: "ဖျော်ဖြေရေး",
            shopping: "စျေးဝယ်",
            health: "ကျန်းမာရေး",
            education: "ပညာရေး",
            other: "အခြား"
        },
        description: "အသေးစိတ်ဖော်ပြချက်",
        amount: "ပမာဏ (MMK)",
        note: "မှတ်စု",
        recordTransaction: "မှတ်တမ်းတင်မည်",
        transactionRecorded: "မှတ်တမ်းတင်ခြင်း အောင်မြင်ပါသည်!",
        transactionRecordedMessage: "သင်၏ ငွေသွင်း/ထုတ် မှတ်တမ်းကို အောင်မြင်စွာ မှတ်တမ်းတင်ပြီးပါပြီ။",
        userId: "အသုံးပြုသူ ID",
        loadingHistory: "မှတ်တမ်းများ ခေါ်ယူနေပါသည်။...",
        noHistory: "မှတ်တမ်းများ မရှိသေးပါ",
        cannotFetchHistoryNoUserId: "မှတ်တမ်းများကို ခေါ်ယူ၍ မရပါ။ (အသုံးပြုသူ ID မရှိပါ)",
        cannotFetchHistoryError: "မှတ်တမ်းများကို ခေါ်ယူ၍ မရပါ။ (အမှားအယွင်း)",
        fillRequiredFields: "လိုအပ်သော အချက်အလက်များကို ဖြည့်သွင်းပါ။",
        invalidAmount: "ပမာဏကို မှန်ကန်စွာ ထည့်သွင်းပါ။ (ဥပမာ: ဂဏန်းဖြစ်ရမည်၊ သုညထက်ကြီးရမည်)",
        minAmount: "အနည်းဆုံး ပမာဏ ၁၀၀ MMK ဖြစ်ရပါမည်။",
        maxAmount: "အများဆုံး ပမာဏ ၁,၀၀၀,၀၀,၀၀၀ MMK ထက် မကျော်လွန်ရပါ။",
        firebaseNotReady: "Firebase ချိတ်ဆက်မှု မပြီးပြတ်သေးပါ။ ခဏစောင့်ပြီး ပြန်လည်စမ်းသပ်ပါ။",
        transactionFailed: "မှတ်တမ်းတင်ခြင်း မအောင်မြင်ပါ။ ကျေးဇူးပြု၍ ပြန်လည်စမ်းသပ်ပါ။",
        amountLabel: "ပမာဏ",
        successClose: "ပိတ်မည်",
        loadingApp: "အက်ပ်ဖွင့်နေပါသည်။...",
        appInitError: "အက်ပ် စတင်ရာတွင် အမှားအယွင်းရှိပါသည်။",
        currentBalance: "လက်ရှိလက်ကျန်ငွေ",
        totalIncome: "စုစုပေါင်းဝင်ငွေ",
        totalExpense: "စုစုပေါင်းအသုံးစရိတ်",
        recentTransactions: "နောက်ဆုံး မှတ်တမ်းများ",
        viewAll: "အားလုံးကြည့်မည်",
        addTransaction: "မှတ်တမ်းအသစ်ထည့်မည်",
        darkMode: "အမှောင် Mode"
    },
    en: {
        appName: "Salary Savings App",
        dashboard: "Dashboard",
        menu: "Menu",
        transactionForm: "Record Transaction",
        transactionHistory: "Transaction History",
        settings: "Settings",
        language: "Language",
        burmese: "Burmese",
        english: "English",
        dateTime: "Date/Time",
        type: "Type",
        income: "Income",
        expense: "Expense",
        category: "Category",
        categories: {
            salary: "Salary",
            food: "Food",
            transport: "Transport",
            rent: "Rent",
            utilities: "Utilities",
            entertainment: "Entertainment",
            shopping: "Shopping",
            health: "Health",
            education: "Education",
            other: "Other"
        },
        description: "Description",
        amount: "Amount (MMK)",
        note: "Note",
        recordTransaction: "Record Transaction",
        transactionRecorded: "Transaction Recorded!",
        transactionRecordedMessage: "Your transaction has been successfully recorded.",
        userId: "User ID",
        loadingHistory: "Loading history...",
        noHistory: "No history yet",
        cannotFetchHistoryNoUserId: "Cannot fetch history (No user ID)",
        cannotFetchHistoryError: "Cannot fetch history (Error)",
        fillRequiredFields: "Please fill in all required fields.",
        invalidAmount: "Please enter a valid amount. (e.g., must be a number, greater than zero)",
        minAmount: "Minimum amount is 100 MMK.",
        maxAmount: "Maximum amount is 1,000,000,000 MMK.",
        firebaseNotReady: "Firebase connection not ready. Please wait a moment and try again.",
        transactionFailed: "Transaction failed. Please try again.",
        amountLabel: "Amount",
        successClose: "Close",
        loadingApp: "Loading app...",
        appInitError: "Error initializing app.",
        currentBalance: "Current Balance",
        totalIncome: "Total Income",
        totalExpense: "Total Expense",
        recentTransactions: "Recent Transactions",
        viewAll: "View All",
        addTransaction: "Add New Transaction",
        darkMode: "Dark Mode"
    }
};

// --- Main App Component ---
function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Initialize language from localStorage or default to 'my'
    const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'my');
    // Initialize dark mode from localStorage or default to false
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

    const [firebaseInitialized, setFirebaseInitialized] = useState(false);
    const [authReady, setAuthReady] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState(null);
    const [showTransactionSuccessModal, setShowTransactionSuccessModal] = useState(false);
    const [appInitializationError, setAppInitializationError] = useState(null);

    const t = translations[language];

    // Effect to update localStorage when language changes
    useEffect(() => {
        localStorage.setItem('appLanguage', language);
    }, [language]);

    // Effect to apply dark mode class to html element and update localStorage
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [darkMode]);

    // Firebase Initialization and Auth Listener
    useEffect(() => {
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        if (Object.keys(firebaseConfig).length === 0) {
            const errorMsg = t.appInitError + ": Firebase config is missing. Please ensure the environment provides '__firebase_config'.";
            console.error(errorMsg);
            setAppInitializationError(errorMsg);
            setFirebaseInitialized(false);
            setHistoryLoading(false);
            setHistoryError("Firebase config missing.");
            return;
        }

        try {
            const appInstance = initializeApp(firebaseConfig);
            const firestoreInstance = getFirestore(appInstance);
            const authInstance = getAuth(appInstance);

            setDb(firestoreInstance);
            setAuth(authInstance);
            setFirebaseInitialized(true);

            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setCurrentUserId(user.uid);
                    console.log("Firebase Auth Ready. User ID:", user.uid);
                } else {
                    setCurrentUserId(null);
                    console.log("Firebase Auth Not Ready or No User Signed In.");
                    if (!initialAuthToken) {
                        try {
                            await signInAnonymously(authInstance);
                            console.log("Signed in anonymously for history feature.");
                        } catch (error) {
                            console.error("Error signing in anonymously:", error);
                        }
                    }
                }
                setAuthReady(true);
            });

            const signIn = async () => {
                if (initialAuthToken) {
                    try {
                        await signInWithCustomToken(authInstance, initialAuthToken);
                        console.log("Signed in with custom token.");
                    } catch (error) {
                        console.error("Error signing in with custom token:", error);
                        try {
                            await signInAnonymously(authInstance);
                            console.log("Signed in anonymously after custom token failure.");
                        } catch (anonError) {
                            console.error("Error signing in anonymously:", anonError);
                        }
                    }
                } else {
                    try {
                        await signInAnonymously(authInstance);
                        console.log("Signed in anonymously.");
                    } catch (error) {
                        console.error("Error signing in anonymously:", error);
                    }
                }
            };
            signIn();

            return () => unsubscribe();
        } catch (error) {
            const errorMsg = t.appInitError + `: ${error.message}`;
            console.error(errorMsg, error);
            setAppInitializationError(errorMsg);
            setFirebaseInitialized(false);
            setHistoryLoading(false);
            setHistoryError("Firebase initialization failed.");
        }
    }, [t.appInitError]);

    // Load Transaction History
    useEffect(() => {
        if (db && authReady && currentUserId) {
            setHistoryLoading(true);
            setHistoryError(null);
            const transactionsCollectionRef = collection(db, `artifacts/${__app_id}/users/${currentUserId}/transactions`);
            const q = query(transactionsCollectionRef);

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const historyItems = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    historyItems.push({ id: doc.id, ...data });
                });

                historyItems.sort((a, b) => {
                    const timeA = a.timestamp ? a.timestamp.toDate() : new Date(0);
                    const timeB = b.timestamp ? b.timestamp.toDate() : new Date(0);
                    return timeB.getTime() - timeA.getTime();
                });
                setTransactionHistory(historyItems);
                setHistoryLoading(false);
            }, (error) => {
                console.error("Error fetching transaction history:", error);
                setHistoryError(t.cannotFetchHistoryError);
                setHistoryLoading(false);
            });

            return () => unsubscribe();
        } else if (authReady && !currentUserId) {
            setHistoryLoading(false);
            setHistoryError(t.cannotFetchHistoryNoUserId);
        }
    }, [db, authReady, currentUserId, language, t.cannotFetchHistoryError, t.cannotFetchHistoryNoUserId]);

    // Function to toggle sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Function to save transaction to Firestore
    const saveTransactionToFirestore = async (transactionData) => {
        if (!db || !currentUserId) {
            console.error("Firestore or User ID not available. Cannot save transaction.");
            return false;
        }
        try {
            const transactionsCollectionRef = collection(db, `artifacts/${__app_id}/users/${currentUserId}/transactions`);
            await addDoc(transactionsCollectionRef, {
                ...transactionData,
                timestamp: serverTimestamp()
            });
            console.log("Transaction data saved to Firestore successfully!");
            return true;
        } catch (error) {
            console.error("Error saving transaction to Firestore:", error);
            return false;
        }
    };

    // Function to handle successful transaction
    const handleTransactionSuccess = () => {
        setShowTransactionSuccessModal(true);
        setTimeout(() => {
            setShowTransactionSuccessModal(false);
        }, 3000);
        setCurrentPage('transactionForm');
    };

    // Calculate totals for summary
    const totalIncome = transactionHistory.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = transactionHistory.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
    const currentBalance = totalIncome - totalExpense;

    // Render loading or error screen if Firebase is not initialized or there's an error
    if (!firebaseInitialized || appInitializationError) {
        return (
            <LanguageContext.Provider value={language}>
                <ThemeContext.Provider value={darkMode}>
                    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300 p-4 w-full h-full"> {/* Added w-full h-full */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 w-full max-w-sm text-center text-gray-700 dark:text-gray-200 transition-colors duration-300 min-h-[200px] flex flex-col justify-center items-center">
                            {appInitializationError ? (
                                <>
                                    <p className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">{t.appInitError}</p>
                                    <p className="text-sm mb-4">{appInitializationError}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Firebase ချိတ်ဆက်မှုမရှိလျှင် မှတ်တမ်းအင်္ဂါရပ် အလုပ်လုပ်မည်မဟုတ်ပါ။</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Canvas ပတ်ဝန်းကျင် ပြန်လည်စတင်ရန် ကြိုးစားပါ။</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">{t.loadingApp}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">စနစ်စတင်နေပါသည်။ ခဏစောင့်ပါ။</p>
                                </>
                            )}
                        </div>
                    </div>
                </ThemeContext.Provider>
            </LanguageContext.Provider>
        );
    }

    // Normal app render if firebase is initialized and no errors
    return (
        <LanguageContext.Provider value={language}>
            <ThemeContext.Provider value={darkMode}>
                <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center p-4 font-inter relative overflow-hidden transition-colors duration-300">
                    {/* Header/Top Bar */}
                    <header className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center justify-between mb-6 transition-colors duration-300">
                        <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t.appName}</h1>
                        <div className="w-6 h-6"></div> {/* Placeholder for alignment */}
                    </header>

                    {/* Sidebar */}
                    <div className={`fixed top-0 left-0 h-full bg-blue-700 text-white w-64 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out shadow-lg rounded-r-xl`}>
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-8">{t.menu}</h2>
                            <nav>
                                <ul>
                                    <li className="mb-4">
                                        <button onClick={() => { setCurrentPage('dashboard'); setIsSidebarOpen(false); }} className="block w-full text-left text-lg py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200">
                                            {t.dashboard}
                                        </button>
                                    </li>
                                    <li className="mb-4">
                                        <button onClick={() => { setCurrentPage('transactionForm'); setIsSidebarOpen(false); }} className="block w-full text-left text-lg py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200">
                                            {t.transactionForm}
                                        </button>
                                    </li>
                                    <li className="mb-4">
                                        <button onClick={() => { setCurrentPage('transactionHistory'); setIsSidebarOpen(false); }} className="block w-full text-left text-lg py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200">
                                            {t.transactionHistory}
                                        </button>
                                    </li>
                                    <li className="mb-4">
                                        <button onClick={() => { setCurrentPage('settings'); setIsSidebarOpen(false); }} className="block w-full text-left text-lg py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200">
                                            {t.settings}
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>

                    {/* Sidebar Overlay */}
                    {isSidebarOpen && (
                        <div onClick={toggleSidebar} className="fixed inset-0 bg-black opacity-50 z-40"></div>
                    )}

                    {/* Main Content Area */}
                    <main className="w-full max-w-lg pb-20"> {/* Add padding-bottom for bottom nav bar */}
                        {currentPage === 'dashboard' && (
                            <Dashboard
                                totalIncome={totalIncome}
                                totalExpense={totalExpense}
                                currentBalance={currentBalance}
                                recentTransactions={transactionHistory.slice(0, 3)} // Show only 3 recent transactions
                                setCurrentPage={setCurrentPage}
                            />
                        )}
                        {currentPage === 'transactionForm' && (
                            <TransactionForm onTransactionSuccess={handleTransactionSuccess} saveTransactionToFirestore={saveTransactionToFirestore} authReady={authReady} currentUserId={currentUserId} />
                        )}
                        {currentPage === 'transactionHistory' && (
                            <TransactionHistory
                                history={transactionHistory}
                                loading={historyLoading}
                                error={historyError}
                                userId={currentUserId}
                                totalIncome={totalIncome}
                                totalExpense={totalExpense}
                                currentBalance={currentBalance}
                            />
                        )}
                        {currentPage === 'settings' && (
                            <Settings language={language} setLanguage={setLanguage} darkMode={darkMode} setDarkMode={setDarkMode} />
                        )}
                    </main>

                    {/* Bottom Navigation Bar */}
                    {firebaseInitialized && !appInitializationError && (
                        <BottomNavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
                    )}

                    {/* Transaction Success Modal */}
                    {showTransactionSuccessModal && <TransactionSuccessModal onClose={() => setShowTransactionSuccessModal(false)} />}
                </div>
            </ThemeContext.Provider>
        </LanguageContext.Provider>
    );
}

// --- Dashboard Component (UPDATED for Dark Mode) ---
function Dashboard({ totalIncome, totalExpense, currentBalance, recentTransactions, setCurrentPage }) {
    const language = useContext(LanguageContext);
    const darkMode = useContext(ThemeContext);
    const t = translations[language];

    const getCategoryLabel = (categoryKey) => {
        return t.categories[categoryKey] || categoryKey;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 w-full mb-6 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">{t.dashboard}</h2>

            {/* Balance Summary Card */}
            <div className="bg-blue-600 dark:bg-blue-800 text-white p-6 rounded-xl shadow-lg mb-8 flex flex-col items-center justify-center transition-colors duration-300">
                <p className="text-sm font-medium opacity-80">{t.currentBalance}</p>
                <p className="text-4xl font-bold mb-4">{currentBalance.toLocaleString()} MMK</p>
                <div className="flex justify-around w-full text-center">
                    <div>
                        <p className="text-green-300 text-lg font-semibold">↑ {totalIncome.toLocaleString()} MMK</p>
                        <p className="text-sm opacity-80">{t.totalIncome}</p>
                    </div>
                    <div>
                        <p className="text-red-300 text-lg font-semibold">↓ {totalExpense.toLocaleString()} MMK</p>
                        <p className="text-sm opacity-80">{t.totalExpense}</p>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t.recentTransactions}</h3>
                    <button onClick={() => setCurrentPage('transactionHistory')} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                        {t.viewAll}
                    </button>
                </div>
                {recentTransactions.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center italic">{t.noHistory}</p>
                ) : (
                    <div className="space-y-3">
                        {recentTransactions.map((item) => (
                            <div key={item.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex justify-between items-center transition-colors duration-300">
                                <div>
                                    <span className={`font-semibold text-lg ${item.type === 'income' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                        {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString()} MMK
                                    </span>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{getCategoryLabel(item.category)} - {item.description}</p>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                    {item.timestamp ? new Date(item.timestamp.toDate()).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add New Transaction Button */}
            <button
                onClick={() => setCurrentPage('transactionForm')}
                className="w-full bg-blue-500 text-white p-4 rounded-lg font-bold text-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                {t.addTransaction}
            </button>
        </div>
    );
}

// --- Transaction Form Component (UPDATED for Dark Mode) ---
function TransactionForm({ onTransactionSuccess, saveTransactionToFirestore, authReady, currentUserId }) {
    const language = useContext(LanguageContext);
    const darkMode = useContext(ThemeContext);
    const t = translations[language];

    const [inputTime, setInputTime] = useState('');
    const [transactionType, setTransactionType] = useState('expense');
    const [category, setCategory] = useState('other');
    const [inputDescription, setInputDescription] = useState('');
    const [inputAmount, setInputAmount] = useState('');
    const [inputNote, setInputNote] = useState('');
    const [amountError, setAmountError] = useState('');

    useEffect(() => {
        setInputTime(new Date().toLocaleString());
    }, []);

    const validateAmount = (amount) => {
        if (isNaN(amount) || amount <= 0) {
            return t.invalidAmount;
        }
        if (amount < 100) {
            return t.minAmount;
        }
        if (amount > 1000000000) {
            return t.maxAmount;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAmountError('');

        if (!inputDescription.trim() || isNaN(parseFloat(inputAmount))) {
            setAmountError(t.fillRequiredFields);
            return;
        }

        const validationResult = validateAmount(parseFloat(inputAmount));
        if (validationResult !== true) {
            setAmountError(validationResult);
            return;
        }

        if (!authReady || !currentUserId) {
            alert(t.firebaseNotReady);
            return;
        }

        const transactionData = {
            time: inputTime,
            type: transactionType,
            category: category,
            description: inputDescription.trim(),
            amount: parseFloat(inputAmount),
            note: inputNote.trim()
        };

        const saveSuccess = await saveTransactionToFirestore(transactionData);

        if (saveSuccess) {
            setInputDescription('');
            setInputAmount('');
            setInputNote('');
            setCategory('other');
            setTransactionType('expense');
            setInputTime(new Date().toLocaleString());
            onTransactionSuccess();
        } else {
            alert(t.transactionFailed);
        }
    };

    const getCategories = () => {
        const cats = t.categories;
        return Object.keys(cats).map(key => ({
            value: key,
            label: cats[key]
        }));
    };

    const categories = getCategories();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 w-full mb-6 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">{t.transactionForm}</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="inputTime" className="block text-gray-700 dark:text-gray-300 font-bold mb-2">{t.dateTime}:</label>
                    <input type="text" id="inputTime" value={inputTime} readOnly className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200" />
                </div>

                <div className="mb-4">
                    <label htmlFor="transactionType" className="block text-gray-700 dark:text-gray-300 font-bold mb-2">{t.type}:</label>
                    <select
                        id="transactionType"
                        value={transactionType}
                        onChange={(e) => {
                            setTransactionType(e.target.value);
                            if (e.target.value === 'income') {
                                setCategory('salary');
                            } else {
                                setCategory('other');
                            }
                        }}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    >
                        <option value="income">{t.income}</option>
                        <option value="expense">{t.expense}</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="category" className="block text-gray-700 dark:text-gray-300 font-bold mb-2">{t.category}:</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    >
                        {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="inputDescription" className="block text-gray-700 dark:text-gray-300 font-bold mb-2">{t.description}:</label>
                    <input type="text" id="inputDescription" value={inputDescription} onChange={(e) => setInputDescription(e.target.value)} placeholder={t.description} required className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200" />
                </div>

                <div className="mb-4">
                    <label htmlFor="inputAmount" className="block text-gray-700 dark:text-gray-300 font-bold mb-2">{t.amount}:</label>
                    <input type="number" id="inputAmount" value={inputAmount} onChange={(e) => setInputAmount(e.target.value)} placeholder="ဥပမာ: 10000" min="1" required className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200" />
                    {amountError && <div className="text-red-500 text-sm mt-1">{amountError}</div>}
                </div>

                <div className="mb-6">
                    <label htmlFor="inputNote" className="block text-gray-700 dark:text-gray-300 font-bold mb-2">{t.note}:</label>
                    <textarea id="inputNote" value={inputNote} onChange={(e) => setInputNote(e.target.value)} placeholder={t.note} rows="3" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-y"></textarea>
                </div>
                <button type="submit" className="w-full bg-green-500 text-white p-3 rounded-lg font-bold text-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-105 shadow-md">
                    {t.recordTransaction}
                </button>
            </form>
        </div>
    );
}

// --- Transaction History Component (UPDATED for Dark Mode) ---
function TransactionHistory({ history, loading, error, userId, totalIncome, totalExpense, currentBalance }) {
    const language = useContext(LanguageContext);
    const darkMode = useContext(ThemeContext);
    const t = translations[language];

    const getCategoryLabel = (categoryKey) => {
        return t.categories[categoryKey] || categoryKey;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 w-full transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">{t.transactionHistory}</h2>
            <div className="text-gray-600 dark:text-gray-300 text-sm mb-4 text-center break-all">
                {t.userId}: {userId || 'N/A'}
            </div>

            {/* Summary Section */}
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg shadow-sm mb-6 border border-blue-200 dark:border-blue-700">
                <p className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">{t.currentBalance}: <span className={currentBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>{currentBalance.toLocaleString()} MMK</span></p>
                <p className="text-md text-green-700 dark:text-green-300">+{t.totalIncome}: {totalIncome.toLocaleString()} MMK</p>
                <p className="text-md text-red-700 dark:text-red-300">-{t.totalExpense}: {totalExpense.toLocaleString()} MMK</p>
            </div>

            {loading && <p className="text-gray-500 dark:text-gray-400 text-center">{t.loadingHistory}</p>}
            {error && <p className="text-red-500 dark:text-red-400 text-center">{error}</p>}
            {!loading && !error && history.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center italic">{t.noHistory}</p>
            )}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {history.map((item) => (
                    <div key={item.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 transition-colors duration-300">
                        <div className="flex justify-between items-center mb-1">
                            <span className={`font-semibold text-lg ${item.type === 'income' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString()} MMK
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{item.timestamp ? new Date(item.timestamp.toDate()).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div className="text-gray-700 dark:text-gray-300 text-sm">
                            <p><strong>{t.type}:</strong> {item.type === 'income' ? t.income : t.expense}</p>
                            <p><strong>{t.category}:</strong> {getCategoryLabel(item.category)}</p>
                            {item.description && <p><strong>{t.description}:</strong> {item.description}</p>}
                            {item.note && <p><strong>{t.note}:</strong> {item.note}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Settings Component (UPDATED for Dark Mode) ---
function Settings({ language, setLanguage, darkMode, setDarkMode }) {
    const t = translations[language];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 w-full transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">{t.settings}</h2>
            <div className="mb-4">
                <label htmlFor="languageSelect" className="block text-gray-700 dark:text-gray-300 font-bold mb-2">{t.language}:</label>
                <select
                    id="languageSelect"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                >
                    <option value="my">{t.burmese}</option>
                    <option value="en">{t.english}</option>
                </select>
            </div>
            <div className="mb-4 flex items-center justify-between">
                <label htmlFor="darkModeToggle" className="block text-gray-700 dark:text-gray-300 font-bold">{t.darkMode}:</label>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        id="darkModeToggle"
                        value=""
                        className="sr-only peer"
                        checked={darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
            </div>
        </div>
    );
}

// --- Transaction Success Modal Component (UPDATED for Dark Mode) ---
function TransactionSuccessModal({ onClose }) {
    const language = useContext(LanguageContext);
    const darkMode = useContext(ThemeContext);
    const t = translations[language];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-sm text-center transform scale-95 opacity-0 animate-scaleIn transition-colors duration-300">
                <div className="text-green-500 text-7xl mb-4 animate-bounceIn">
                    &#10003; {/* Unicode checkmark */}
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">{t.transactionRecorded}</h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">{t.transactionRecordedMessage}</p>
                <button
                    onClick={onClose}
                    className="bg-blue-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                    {t.successClose}
                </button>
            </div>

            <style>
                {`
                @keyframes scaleIn {
                    from { transform: scale(0.7); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes bounceIn {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.1); opacity: 1; }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); }
                }
                .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
                .animate-bounceIn { animation: bounceIn 0.6s ease-out forwards; }
                `}
            </style>
        </div>
    );
}

// --- Bottom Navigation Bar Component (UPDATED for Dark Mode) ---
function BottomNavBar({ currentPage, setCurrentPage }) {
    const language = useContext(LanguageContext);
    const darkMode = useContext(ThemeContext);
    const t = translations[language];

    const navItems = [
        { name: 'dashboard', icon: '🏠', label: t.dashboard },
        { name: 'transactionForm', icon: '📝', label: t.recordTransaction },
        { name: 'transactionHistory', icon: '📊', label: t.transactionHistory },
        { name: 'settings', icon: '⚙️', label: t.settings },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-xl rounded-t-2xl p-3 max-w-lg mx-auto z-40 flex justify-around items-center border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
            {navItems.map((item) => (
                <button
                    key={item.name}
                    onClick={() => setCurrentPage(item.name)}
                    className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200
                        ${currentPage === item.name ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                    `}
                >
                    <span className="text-2xl mb-1">{item.icon}</span>
                    <span className="text-xs">{item.label}</span>
                </button>
            ))}
        </div>
    );
}

export default App;
