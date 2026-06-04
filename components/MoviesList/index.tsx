import Image from "next/image";
import { useState } from "react";
import LoadMoreButton from "../LoadMoreButton";

interface Movie {
  title: string;
  image: string;
  category: string[];
  rating: string;
  durationMinutes: number;
  showtimes: string[];
}

interface MoviesListProps {
  selectedDate: string;
  data?: Movie[];
}

export default function MoviesList({ selectedDate, data }: MoviesListProps) {
  const [limit, setLimit] = useState(6);
  const [loading, setLoading] = useState(false);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setLimit((prev) => prev + 6);
      setLoading(false);
    }, 400);
  };

  const formatDuration = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} HR ${minutes} MIN`;
  };

  const formatTime = (isoString: string | number | Date) => {
    return new Date(isoString)
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/\s+/g, "");
  };

  // 3. Filter all movies for the date
  const filteredMovies =
    data?.filter((movie) =>
      movie.showtimes.some((dateTime) => dateTime.startsWith(selectedDate)),
    ) || [];

  // 4. Slice for the UI
  const visibleMovies = filteredMovies.slice(0, limit);

  if (filteredMovies?.length === 0) {
    return (
      <div className="text-center py-20 border border-[#A7A7A740] mt-16 italic text-gray-500">
        No movies available for the selected date.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 border-t border-l border-[#A7A7A740] md:grid-cols-2 mt-16">
        {visibleMovies?.map((movie, index) => (
          <div
            key={`${movie.title}-${index}`}
            className="movie-item flex border-r border-b border-[#A7A7A740]"
          >
            <div className="border-r w-full max-w-[260px] relative aspect-212/342 p-6 border-[#A7A7A740]">
              <Image
                className="w-full h-full object-cover"
                alt={movie.title}
                width={212}
                height={342}
                src={movie.image}
              />
            </div>

            <div className="p-6 flex-1">
              <div className="flex gap-4">
                {movie.category.map((tag, i) => (
                  <span
                    key={i}
                    className="border uppercase mb-3 block py-0.5 px-4 font-light border-[#14141440] text-black text-[14px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h6 className="mt-3 mb-0 text-[24px] font-regular text-black ">
                {movie.title}
              </h6>

              <div className="flex gap-6 mt-3">
                <span className="border-r font-medium last:border-r-0 text-[#646464] pr-6 uppercase block border-[#A7A7A740]">
                  {movie.rating}
                </span>
                <span className="font-medium text-[#646464] uppercase block">
                  {formatDuration(movie.durationMinutes)}
                </span>
              </div>

              <div className="flex mt-6 gap-4 flex-wrap">
                {movie.showtimes
                  .filter((isoTime) => isoTime.startsWith(selectedDate))
                  .map((isoTime, i) => (
                    <span
                      key={i}
                      className="px-8 border border-[#0000001A] p-3 text-[18px] text-black font-light hover:bg-black hover:text-white transition-all cursor-pointer"
                    >
                      {formatTime(isoTime)}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Integrated LoadMoreButton */}
      <div className="pt-16">
      <LoadMoreButton
        onLoadMore={handleLoadMore}
        hasMore={filteredMovies.length > limit}
        loading={loading}
      />
      </div>
    </>
  );
}
