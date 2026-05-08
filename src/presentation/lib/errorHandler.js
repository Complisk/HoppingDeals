export const extractErrorMessage = (error) => {
  if (typeof error === "string") return error;
  if (error?.message && typeof error.message === "string") return error.message;
  if (error?.error && typeof error.error === "string") return error.error;
  if (error?.data?.message && typeof error.data.message === "string") return error.data.message;
  return "An error occurred. Please try again.";
};

export const getStatusMeaning = (status) => {
  const meanings = {
    active: "Running - Promotion is currently active and running",
    inactive: "Not Running - Promotion has stopped or expired",
    pending: "Not Approved - Waiting for admin approval",
    approved: "Approved - Ready to run",
    rejected: "Rejected - Admin has rejected this promotion",
    expired: "Expired - Promotion duration has ended",
  };
  return meanings[String(status).toLowerCase()] || `Status: ${status}`;
};

export const getStatusColor = (status) => {
  const colors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
  };
  return colors[String(status).toLowerCase()] || "bg-gray-100 text-gray-800";
};
