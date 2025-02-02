import { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const formatCurrency = (value,kushti) => {
  if (value == null || isNaN(value)) return `0.00 ${!kushti ? '€':''}`;

  const formattedValue = new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return `${formattedValue} ${!kushti ? '€':''}`;
};
export const normalizoDaten = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0); // Set time to 00:00:00
  return d;
};
export const localTodayDate = () => {
  const today = new Date();
  const localDate = today.toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' }); 
  return localDate
}


export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({});

  const updateAuthData = (newData) => {
    setAuthData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  useEffect(() => {
    const perdoruesiID = Cookies.get('perdoruesiID');
    const emriPerdoruesit = Cookies.get('emriPerdoruesit');
    const aKaUser = Cookies.get('aKaUser');
    const nderrimiID = Cookies.get('nderrimiID');
    const avansi = formatCurrency(Cookies.get('avansi'), true);
    const numriPercjelles = Cookies.get('numriPercjelles');
    const dataFillimit = Cookies.get('dataFillimit');
    const folderPathGarancionet = 'C:\\Users\\BerdynaTech\\Documents\\btechPDFtest';
    const shitjeFunditID = Cookies.get('shitjeFunditID');
    console.log('shitjaFunditID:', shitjeFunditID);
    setAuthData({
      perdoruesiID,
      emriPerdoruesit,
      aKaUser,
      nderrimiID,
      avansi,
      numriPercjelles,
      dataFillimit,
      folderPathGarancionet,
      shitjeFunditID,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ authData, updateAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the context for consumption
export default AuthContext;