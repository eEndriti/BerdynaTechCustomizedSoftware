import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export const formatCurrency = (value) => {
  if (value == null || isNaN(value)) return '0.00 €';

  const formattedValue = new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return `${formattedValue} €`;
};


const useAuthData = () => {
  const [authData, setAuthData] = useState({});

  useEffect(() => {
    const perdoruesiID = Cookies.get('perdoruesiID');
    const emriPerdoruesit = Cookies.get('emriPerdoruesit');
    const aKaUser = Cookies.get('aKaUser');
    const nderrimiID = Cookies.get('nderrimiID');
    const avansi = formatCurrency(Cookies.get('avansi')); 
    const numriPercjelles = Cookies.get('numriPercjelles');
    const dataFillimit = Cookies.get('dataFillimit');

    setAuthData({
      perdoruesiID,
      emriPerdoruesit,
      aKaUser,
      nderrimiID,
      avansi,
      numriPercjelles,
      dataFillimit,
    });
  }, []);

  return authData;
};

export default useAuthData;
