import { Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { useSelector, useDispatch } from "react-redux";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { throttle } from "lodash";
import axios from "axios";

import CusineDropdown from "./cusine_dropdown";

import { AppDispatch, RootState } from "@/store/store";
import { setDistance, setBudget, setSearchResults } from "@/store/searchSlice";
import useGeolocation from "@/hooks/useGeolocation";

const APIKEY = "76245f1675bc405ca3a5d9364e03a46c";

const HeroSearch = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cuisine, distance, budget, latitude, longitude } = useSelector(
    (state: RootState) => state.search,
  );
  const [readyToSearch, setReadyToSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use the custom hook to obtain the geolocation function
  const fetchGeolocation = useGeolocation();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    switch (name) {
      case "distance":
        dispatch(setDistance(parseInt(value)));
        break;
      case "budget":
        dispatch(setBudget(parseInt(value)));
        break;
      default:
        break;
    }
  };

  const throttledHandleInputChange = throttle(handleInputChange, 1000);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!cuisine || !distance || !budget) {
        throw new Error("Form is missing required fields");
      }

      setIsLoading(true);

      await fetchGeolocation();
      await setReadyToSearch(true);
    } catch (error) {
      console.error("Error during handleSearch:", error);
    }
  };

  useEffect(() => {
    if (readyToSearch) {
      const postData = async () => {
        try {
          console.log("Posting data");
          const response = await axios.get(
            `https://api.spoonacular.com/food/restaurants/search?cuisine=${cuisine}&budget=${budget}&distance=${distance}&lat=${latitude}&lng=${longitude}&apiKey=${APIKEY}`,
          );

          dispatch(setSearchResults(response.data.restaurants));
        } catch (error) {
          console.error("Error during fetch:", error);
        } finally {
          setIsLoading(false);
          setReadyToSearch(false);
        }
      };

      postData();
    }
  }, [readyToSearch]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-center text-center bg-slate-400">
      <form
        className="flex flex-col md:flex-col items-center gap-6 px-16 sm:py-4 lg:pl-56"
        onSubmit={handleSearch}
      >
        <CusineDropdown />
        <Input
          className="w-full md:w-auto"
          defaultValue={distance.toString()}
          endContent="mi"
          label="Distance"
          name="distance"
          placeholder='e.g "10"'
          type="number"
          onChange={throttledHandleInputChange}
        />
        <Input
          className="w-full md:w-auto"
          defaultValue={budget.toString()}
          endContent="$"
          label="Budget"
          name="budget"
          placeholder='e.g "30"'
          type="number"
          onChange={throttledHandleInputChange}
        />
        <Button
          className="w-full bg-amber-500 font-semibold text-medium text-slate-800 tracking-wide"
          isLoading={isLoading}
          type="submit"
        >
          Search
        </Button>
      </form>
      <div className="hidden md:flex flex-row  mt-4 md:mt-0">
        <img
          alt="Coffee"
          className="h-24 md:h-72 md:w-[345]"
          height="96"
          loading="eager"
          src={`./assets/monika-grabkowska-oMIWD_Ob0oA-unsplash.webp`}
        />
        <img
          alt="Crossaint"
          className="h-24 md:h-72 md:w-[345]"
          height="96"
          loading="eager"
          src={`./assets/monika-grabkowska-eAsck4oAguM-unsplash.webp`}
        />
        <img
          alt="Pancakes"
          className="h-24 hidden md:block md:h-72 md:w-[345]"
          height="96"
          loading="eager"
          src={`./assets/monika-grabkowska-P1aohbiT-EY-unsplash.webp`}
        />
      </div>
    </div>
  );
};

export default HeroSearch;
