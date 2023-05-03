export  const formatDate = (date) => date
    ? new Date(date).toLocaleDateString() + " " + new Date(date).toLocaleTimeString()
    : "";