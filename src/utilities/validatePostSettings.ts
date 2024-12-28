// verifies that time and day are both supplied or neither are supplied

// if only time or only day is supplied -> throw an error
// if neither are supplied -> let it through ?
//
// if both are supplied -> let it through

// should return a schedule in the shape that db wants.

type PostSettings = {
  isEnabled: boolean;
  maxWords: number;
  time: string;
  daysOfWeek: (string | number)[];
  timezone: string;
  personality: string;
};

const validatePostSettings = (postSettings: PostSettings): boolean => {
  const { time, daysOfWeek, timezone } = postSettings;
  if (!time || !daysOfWeek || !timezone) {
    console.log("postSettigns are NOT valid");
    return false;
  } else {
    console.log("postSettigns ARE valid");
    return true;
  }
};

export default validatePostSettings;