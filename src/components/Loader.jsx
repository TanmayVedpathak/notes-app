const Loader = ({ height = "h-screen" }) => {
  return (
    <>
      <div className={`${height} text-5xl font-bold text-gray-900 dark:text-white flex justify-center items-center`}>Loading...</div>
    </>
  );
};

export default Loader;
