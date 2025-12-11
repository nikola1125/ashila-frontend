import React, { useEffect, useState } from 'react';
import { Switch } from '@headlessui/react';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';

const SwitchCom = ({ ad, onStatusChange }) => {
  const { privateApi } = useAxiosSecure();
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setEnabled(ad.status === 'active' ? true : false)
  }, [ad])

  const handleChange = async () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);

    const statusData = {
      status: newEnabled ? 'active' : 'inactive',
    };

    const response = await privateApi.patch(`/ads/${ad._id}`, statusData);
    if (response?.modifiedCount > 0 && onStatusChange) {
      onStatusChange({ ...ad, status: statusData.status });
    }
  };

  return (
    <Switch
      checked={enabled}
      onChange={handleChange}
      className="group relative flex h-7 w-14 cursor-pointer rounded-full bg-blue-200/60 p-1 transition-colors duration-200 focus:outline-none"
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-7' : 'translate-x-0'
        }`}
      />
    </Switch>
  );
};

export default SwitchCom;
