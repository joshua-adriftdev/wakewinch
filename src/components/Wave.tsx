import * as React from "react"
import Svg, { Path } from "react-native-svg"

// @ts-ignore
const SvgComponent = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={480}
    height={272}
    fill="none"
    {...props}
  >
    <Path
      fill="#3A93F8"
      d="M-88.548 271.564c-29.826-5.833 0-40.184 0-40.184L-108-35l576.421 18.148s74.702 47.703 91.423 116.014C589.67 221.01 441 231.38 343.929 243.046c-97.07 11.667-151.723-40.832-261.302-30.462-109.578 10.37-141.35 64.813-171.175 58.98Z"
    />
  </Svg>
)
export default SvgComponent
