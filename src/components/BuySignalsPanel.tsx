import React, { useEffect, useState } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Crown, User, Loader2 } from 'lucide-react';
import { FaTelegram } from 'react-icons/fa';
import { FreeSignalCard } from './FreeSignalCard';
import  {PremiumSignalCard } from './PremiumSignalCard';
import Buttons from './Buttons';
import { useData } from '../context/DataContext';
import { useAccount } from 'wagmi';
import { DataProvider } from '../context/DataContext';
import { SignalData } from '../types'; // if not already imported

export const BuySignalsPanel: React.FC = () => {
  const { signals = [], loading: signalsLoading } = useData();
  const { openConnectModal } = useConnectModal();
  const { address } = useAccount();
  const [isPremium, setIsPremium] = useState(() => 
    localStorage.getItem('premium_status') === 'active'
  );
  
  interface UserData {
    subscription?: {
      status: string;
      cancelAtPeriodEnd: boolean;
    };
  }

  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState('');


  useEffect(() => {
    const checkUserStatus = async () => {
      if (!address) return;
      
      setLoading(true);
      setError('');
      
      try {
        // Updated API endpoint
        const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ walletAddress: address }),
        });
        
        const registerData = await registerResponse.json();
        
        if (!registerData.success) {
          throw new Error(registerData.message);
        }
        
        // Store JWT token
        localStorage.setItem('auth_token', registerData.token);
        
        // Updated API endpoint for subscription check
        const subscriptionResponse = await fetch('http://localhost:5000/api/auth/check-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${registerData.token}`
          },
          body: JSON.stringify({ walletAddress: address }),
        });
        
        const subscriptionData = await subscriptionResponse.json();
        
        if (!subscriptionData.success) {
          throw new Error(subscriptionData.message);
        }
        
        setUserData(subscriptionData.user);
      } catch (err) {
        console.error('Error checking subscription:', err);
        setError(err instanceof Error ? err.message : 'Failed to check subscription status');
      } finally {
        setLoading(false);
      }
    };
    
    checkUserStatus();
  }, [address]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('pid');
    
    if (pid) {
      setIsPremium(true);
      localStorage.setItem('premium_status', 'active');
    }
  }, []);

  const isPremiumActive = userData && !!!userData?.subscription?.cancelAtPeriodEnd;
  
  const mockSignals: SignalData[] = [
    { symbol: "MOCK1", description: "Mock signal data 1", risks: [] },
    { symbol: "MOCK1", description: "Mock signal data 1", risks: [] },
    { symbol: "MOCK1", description: "Mock signal data 1", risks: [] },
    { symbol: "MOCK1", description: "Mock signal data 1", risks: [] },
    { symbol: "MOCK1", description: "Mock signal data 1", risks: [] },
    { symbol: "MOCK1", description: "Mock signal data 1", risks: [] },
    { symbol: "MOCK2", description: "Mock signal data 2", risks: [] }
  ];
  const displaySignals = isPremiumActive ? signals : (signals.length ? signals : mockSignals);

  const handleUpgradeToPremium = () => {
    window.open('https://pay.boomfi.xyz/2rwqC9PH4zXMNqTupAXjsNyNJ3v', '_blank');
  };

  const handleTelegramSupport = () => {
    window.open('https://t.me/+1oKOrFd0G2RjYjVk', '_blank');
  };

  return (
    <div className="h-full bg-black flex flex-col border-l-3 border-gray-300">
      <div className="flex flex-row items-center justify-between p-8 sm p-4   h-16">
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : isPremiumActive ? (
            <>
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm">Premium</span>
            </>
          ) : (
            <>
              <User className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Free</span>
            </>
          )}
        </div>

        {address ? (
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1B61B3] rounded-full">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-xs text-[#DDDDDD]">
              {`${address.slice(0, 6)}...${address.slice(-4)}`}
            </span>
          </button>
        ) : (
          <button onClick={openConnectModal} className="text-sm text-white bg-[#1B61B3] px-4 py-1 rounded-full"> 
            Connect Wallet
          </button>
        )}
      </div>

  
      <div className=" px-0 sm:px-4 py-0 sm:py-2 ">
        <h1 className=" flex  items-center  justify-center text-2xl p-0 sm:p-7 text-white font-semibold  w-full">Latest Buy Signals</h1>
      </div>

        {error && (
        <div className="px-4 py-2">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 pb-6 custom-scrollbar">
        {signalsLoading || loading ? (
          <div className="text-white text-center mt-8">Loading signals...</div>
        ) : displaySignals?.length > 0 ? (
          <div className="space-y-4 p-5 md:p-0">
            {displaySignals.map((signal, index) =>
              isPremiumActive ? (
                <PremiumSignalCard key={index} signal={signal}  />
              ) : (
                <FreeSignalCard key={index} signal={signal}  />
                
              )
            )}
          </div>
        ) : (
          <div className="text-white text-center mt-8">No signals available</div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800/50 mb-4 ">
        {!isPremiumActive ? (
          <button onClick={handleUpgradeToPremium} className="w-full h-full flex items-center justify-center ">
            <Buttons/>
          </button>
        ) : (
          <div className='p-6 md:p-0'>
          <button
            onClick={handleTelegramSupport}
            className="w-full bg-blue-600 px-0 md:px-3 text-white py-2 md:py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-colors  my-2"
          >
            <span>Premium Support</span>
            <FaTelegram className="w-4 h-4" />
          </button>
         <div className='flex block md:hidden text-white justify-end '>
          Api Access ? <FaTelegram />
         </div>
         </div>
        )}
      </div>
    </div>
  );
};
