import React from 'react';
import Svg, {Defs, LinearGradient, Path, Stop} from 'react-native-svg';

const TagLogoGold = ({height, width}) => {
  return (
    <Svg
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 155.51 230.96"
      height={height}
      width={width}>
      <Defs>
        <LinearGradient
          id="a"
          y1={115.48}
          x2={155.51}
          y2={115.48}
          gradientUnits="userSpaceOnUse">
          <Stop offset={0} stopColor="#fed000" />
          <Stop offset={1} stopColor="#fcba00" />
        </LinearGradient>
      </Defs>
      <Path
        d="M142.66 29.84 86.2 2a18.94 18.94 0 0 0-16.89 0L12.85 29.84C5 33.67 0 42.44 0 52.14v154.5C0 220.08 9.54 231 21.3 231h112.91c11.76 0 21.3-10.88 21.3-24.32V52.14c0-9.7-5.04-18.47-12.85-22.3Zm-64.9-8.71a11.36 11.36 0 1 1-11.35 11.35 11.35 11.35 0 0 1 11.35-11.35Zm54.51 123.28c-4.19 4.41-8.36 8.86-12.52 13.3-1.36 1.46-2.58 1.4-4 0-8.16-7.41-10.74-11.49-19-18.85-4.45-4-15.55-.29-22.49-14.77-8.28 0-19.23 4.37 2.1 86.17.56 2.14-35-40.89-45.14-57.26-12.54-20.2-12.27-53.34 5.65-67.7l.46-.39a80.19 80.19 0 0 1 36.8-17.28c13.1-2.6 26.39-1.07 39.59-1.36 2.57 0 3 .61 1.82 3.19-1.71 3.94-3.65 7.79-5.57 11.63a6 6 0 0 0-.1 5.5c3.75 8.62 7.28 17.34 10.9 26q5.74 13.88 11.44 27.7c.54 1.33 1.44 2.71.06 4.12Z"
        style={{
          fill: 'url(#a)',
        }}
      />
    </Svg>
  );
};

export default TagLogoGold;
