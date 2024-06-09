const getUnixTime = timestamp => {
  return new Date(timestamp ?? "").getTime();
};

export default getUnixTime;
