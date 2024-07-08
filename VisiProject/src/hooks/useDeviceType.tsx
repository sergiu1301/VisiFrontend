import React from "react";

const useDeviceType = () => {
    const [deviceType, setDeviceType] = React.useState<'Mobile' | 'Desktop'>('Desktop');

    React.useEffect(() => {
        const userAgent = navigator.userAgent;

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            setDeviceType('Mobile');
        } else {
            setDeviceType('Desktop');
        }
    }, []);

    return deviceType;
};

export default useDeviceType;