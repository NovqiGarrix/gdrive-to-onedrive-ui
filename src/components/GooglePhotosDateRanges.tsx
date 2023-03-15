import { FunctionComponent, useMemo } from "react";

import Datepicker from "react-tailwindcss-datepicker";
import type { DateValueType } from "react-tailwindcss-datepicker/dist/types";

import useGooglePhotosFilter from "../hooks/useGooglePhotosFilter";

const GooglePhotosDateRanges: FunctionComponent = () => {
  const endDate = useGooglePhotosFilter((s) => s.endDate);
  const setEndDate = useGooglePhotosFilter((s) => s.setEndDate);

  const startDate = useGooglePhotosFilter((s) => s.startDate);
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
        value={{ startDate, endDate }}
      />
    </div>
  );
};

export default GooglePhotosDateRanges;
