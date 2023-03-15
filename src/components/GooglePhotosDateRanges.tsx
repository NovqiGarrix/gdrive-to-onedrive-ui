import { FunctionComponent } from "react";

import Datepicker from "react-tailwindcss-datepicker";
import type { DateValueType } from "react-tailwindcss-datepicker/dist/types";

import useGooglePhotosFilter from "../hooks/useGooglePhotosFilter";

const GooglePhotosDateRanges: FunctionComponent = () => {
  const endDate = useGooglePhotosFilter((s) => s.endDate);
  const setEndDate = useGooglePhotosFilter((s) => s.setEndDate);

  const startDate = useGooglePhotosFilter((s) => s.startDate);
  const setStartDate = useGooglePhotosFilter((s) => s.setStartDate);

  function onChange(value: DateValueType) {
    const startDateAsDate = value?.startDate ? new Date(value.startDate) : null;
    const endDateAsDate = value?.endDate ? new Date(value.endDate) : null;

    if (startDateAsDate) {
      setStartDate(startDateAsDate);
    }

    if (endDateAsDate) {
      setEndDate(endDateAsDate);
    }
  }

  return (
    <div>
      <Datepicker onChange={onChange} value={{ startDate, endDate }} />
    </div>
  );
};

export default GooglePhotosDateRanges;
