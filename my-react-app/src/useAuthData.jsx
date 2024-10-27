import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const useAuthData = () => {
  const [authData, setAuthData] = useState({});

  useEffect(() => {
    const perdoruesiID = Cookies.get('perdoruesiID');
    const emriPerdoruesit = Cookies.get('emriPerdoruesit');
    const aKaUser = Cookies.get('aKaUser');
    const nderrimiID = Cookies.get('nderrimiID');
    const avansi = Cookies.get('avansi');
    const numriPercjelles = Cookies.get('numriPercjelles');
    const dataFillimit = Cookies.get('dataFillimit');


    setAuthData({ perdoruesiID: perdoruesiID, emriPerdoruesit: emriPerdoruesit,aKaUser:aKaUser,nderrimiID:nderrimiID,avansi:avansi,numriPercjelles:numriPercjelles,dataFillimit:dataFillimit });
  }, []);

  return authData;
};

export default useAuthData;
