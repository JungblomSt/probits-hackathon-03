import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '../theme';

// Enkla streckikoner (samma som i mockupen)
const shapes = {
  check: (c) => <Path d="M5 12.5l4.5 4.5L19 7.5" stroke={c} />,
  close: (c) => <Path d="M6 6l12 12M18 6L6 18" stroke={c} />,
  back: (c) => <Path d="M15 18l-6-6 6-6" stroke={c} />,
  plus: (c) => <Path d="M12 5v14M5 12h14" stroke={c} />,
  bell: (c) => (
    <>
      <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" stroke={c} />
      <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" stroke={c} />
    </>
  ),
  steps: (c) => (
    <>
      <Path d="M4 16v-2.4C4 11.5 3 10.5 3 8c0-2.7 1.5-6 4.5-6C9.4 2 10 3.8 10 5.5c0 3.1-2 5.7-2 8.7V16a2 2 0 1 1-4 0Z" stroke={c} />
      <Path d="M20 20v-2.4c0-2.1 1-3.1 1-5.6 0-2.7-1.5-6-4.5-6C14.6 6 14 7.8 14 9.5c0 3.1 2 5.7 2 8.7V20a2 2 0 1 0 4 0Z" stroke={c} />
    </>
  ),
  dice: (c) => (
    <>
      <Rect x="3" y="3" width="18" height="18" rx="4" stroke={c} />
      <Circle cx="8.5" cy="8.5" r="1.2" fill={c} />
      <Circle cx="12" cy="12" r="1.2" fill={c} />
      <Circle cx="15.5" cy="15.5" r="1.2" fill={c} />
    </>
  ),
  calendar: (c) => (
    <>
      <Rect x="3" y="5" width="18" height="16" rx="3" stroke={c} />
      <Path d="M3 10h18M8 3v4M16 3v4" stroke={c} />
    </>
  ),
  chart: (c) => <Path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke={c} />,
  settings: (c) => (
    <>
      <Circle cx="12" cy="12" r="3" stroke={c} />
      <Path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" stroke={c} />
    </>
  ),
  clock: (c) => (
    <>
      <Circle cx="12" cy="12" r="9" stroke={c} />
      <Path d="M12 7v5l3 2" stroke={c} />
    </>
  ),
  trash: (c) => <Path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" stroke={c} />,
};

export default function Icon({ name, size = 22, color = colors.ink, strokeWidth = 1.8 }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {shapes[name](color)}
    </Svg>
  );
}
