import { FunctionComponent, useMemo } from "react";

import { shallow } from "zustand/shallow";
import Datepicker from "react-tailwindcss-datepicker";
import type { DateValueType } from "react-tailwindcss-datepicker/dist/types";

import useGooglePhotosFilter from "../hooks/useGooglePhotosFilter";

interface GooglePhotosDateRangesProps {
  isDisabled: boolean;
}

const GooglePhotosDateRanges: FunctionComponent<
  GooglePhotosDateRangesProps
> = ({ isDisabled }) => {
  const endDate = useGooglePhotosFilter((s) => s.endDate, shallow);
  const setEndDate = useGooglePhotosFilter((s) => s.setEndDate);

  const startDate = useGooglePhotosFilter((s) => s.startDate, shallow);
  const setStartDate = useGooglePhotosFilter((s) => s.setStartDate);

  function onChange(value: DateValueType) {
    setStartDate(value?.startDate);
    setEndDate(value?.endDate);
  }

  const maxDate = useMemo(() => new Date(), []);

  return (
    <div>
      <Datepicker
        maxDate={maxDate}
        onChange={onChange}
        disabled={isDisabled}
        value={{ startDate, endDate }}
      />
    </div>
  );
};

export default GooglePhotosDateRanges;
