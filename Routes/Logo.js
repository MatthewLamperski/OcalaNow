import React, {useEffect, useState} from 'react';
import {getAsset} from '../FireFunctions';
import {Image, Skeleton} from 'native-base';

const Logo = ({docID}) => {
  const [url, setURL] = useState();
  useEffect(() => {
    getAsset('logo', docID)
      .then(url => setURL(url))
      .catch(err => console.log(err));
  }, []);
  if (url) {
    return (
      <Image
        source={{uri: url}}
        resizeMode="contain"
        alt="Logo"
        style={{height: 30, width: 30}}
        borderRadius={40}
      />
    );
  } else {
    return <Skeleton style={{height: 30, width: 20}} borderRadius={40} />;
  }
};

export default Logo;
