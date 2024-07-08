import React, { useEffect, useState, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import GridLoader from "react-spinners/GridLoader";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

const ConfirmEmail: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const urlData = searchParams.get("userId");

        if (!urlData || urlData.length != 64) {
          throw new Error("Url has not a good format");
        }

        const response = await fetch(
          `${apiUrl}/api/v1/user/${encodeURIComponent(urlData)}/confirm-email`,
          {
            method: "PUT",
          },
        );

        if (!response.ok) {
          navigate("/success_notification?typePage=ConfirmEmail");
          throw new Error("Network response was not ok");
        }

        navigate("/success_notification?typePage=ConfirmEmail");
      } catch (error) {
        setLoading(true);
        navigate("/no_success_notification?typePage=ConfirmEmail");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <GridLoader
        color="#3CB371"
        loading={loading}
        cssOverride={override}
        size={20}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    );
  }

  return null;
};

export default ConfirmEmail;
