import React, {useEffect, useState} from 'react';
import {getPicURL} from '../FireFunctions';
import {Image, Skeleton} from 'native-base';

const Logo = ({logo}) => {
  const [url, setURL] = useState();
  useEffect(() => {
    getPicURL(logo)
      .then(url => setURL(url))
      .catch(err => console.log(err));
  }, []);
  if (url) {
    return (
      <Image
        source={{uri: url}}
        resizeMode="contain"
        alt="Logo"
        height={12}
        width={12}
        borderRadius={40}
      />
    );
  } else {
    return <Skeleton height={8} width={8} borderRadius={40} />;
  }
};

export default Logo;
