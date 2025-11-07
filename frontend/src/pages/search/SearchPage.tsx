import Topbar from "@/components/Topbar";
import SearchBar from "@/components/SearchBar";

const SearchPage = () => {
  return (
    <main className="rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900">
      <Topbar />
      <div className="h-[calc(100vh-160px)] p-4 sm:p-6 overflow-y-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Search</h1>
        <SearchBar />
      </div>
    </main>
  );
};

export default SearchPage;
