// ** React Imports
import { createContext, useContext, useEffect, useMemo, useState } from "react";

// ** Next Import
import { useRouter } from "next/router";

// ** Axios
import axios from "axios";

// ** Config
import authConfig from "src/config/auth";

// ** Defaults
const defaultProvider = {
  user: null,
  // user: { name: 'Roshan' },
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  isInitialized: false,
  setIsInitialized: () => Boolean,
  handleLoginInitial: () => Promise.resolve(),

};
export const AuthContext = createContext(defaultProvider);

export const AuthProvider = ({ children }) => {
  const [refresh, setRefresh] = useState(0)

  // ** States
  const [user, setUser] = useState(defaultProvider.user);
  const [loading, setLoading] = useState(defaultProvider.loading);
  const [isInitialized, setIsInitialized] = useState(
    defaultProvider.isInitialized
  );

  // ** Hooks
  const router = useRouter();
  useEffect(() => {

    const initAuth = async () => {
      setIsInitialized(true);
      const storedToken =
        "Bearer " + window.localStorage.getItem(authConfig.storageTokenKeyName);

      if (storedToken) {
        setLoading(true);
        await axios
          .get(authConfig.meEndpoint, {
            headers: {
              Authorization: storedToken,
            },
          })
          .then(async (response) => {
            setLoading(false);
            console.log(response)
            setUser({ ...response.data.user });
          })
          .catch(() => {
            localStorage.removeItem("userData");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("accessToken");
            setUser(null);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    };
    initAuth();
  }, [refresh]);




  const refreshAuth = () => {
    setRefresh(refresh + 1)
  }






  const handleLoginInitial = (params, userData) => {
    const data = [];
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": "*",
    };
    axios
      .post(authConfig.loginEndpoint, params, { headers: headers })
      // .post(authConfig.loginEndpoint, { email: 'admin@gmail.com', password: 'password' }, { headers: headers })
      .then(async (res) => {
        // window.localStorage.setItem(authConfig.storageTokenKeyName, res.data.accessToken)
        data["message"] = "success";
        data["data"] = res;
        console.log("##########################################################",res)
        // userData(data);
        window.localStorage.setItem(
          authConfig.storageTokenKeyName,
          res.data.details.token
        );
      })
      .then(() => {
        axios
          .get(authConfig.meEndpoint, {
            headers: {
              Authorization:
                "Bearer " +
                window.localStorage.getItem(authConfig.storageTokenKeyName),
            },
          })
          .then(async (response) => {
            const returnUrl = router.query.returnUrl;
            console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",response)
            setUser({ ...response.data.user });

            await window.localStorage.setItem(
              "userData",
              JSON.stringify(response.data.user)
              // response.data.user
            );


            // if (response.data.data.data.name == '' || response.data.data.data.email == '' || response.data.data.data.mobileNo == '') {
            //   router.replace('/account/details')
            // } else {

            if (returnUrl == undefined) {
              router.reload();
            } else {
              const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
              router.replace(redirectURL)
            }


            // }
          });
      })
      .catch((err) => {
        console.log(err)

        if (err.response.status == 400) {
          data["message"] = "failed";
          data["type"] = 0; /* show in email field */
          data["error"] = err.response.data;
          userData(data);
        } else if (err.response.status == 404) {
          data["message"] = "failed";
          data["type"] = 0; /* show in email field */
          data["error"] = err.response.data;
          userData(data);
        } else if (err.response.status == 401) {
          data["message"] = "failed";
          data["type"] = 1; /* show in password field */
          data["error"] = err.response.data;
          userData(data);
        } else {

          data["message"] = "network-error";
          data["type"] = 0; /* show in email field */
          data["error"] = "some thing went wrong";
          userData(data);
        }
      });
  };



















  const values = {
    user,
    loading,
    setUser,
    setLoading,
    isInitialized,
    setIsInitialized,
    refreshAuth: refreshAuth,

    handleLoginInitial: handleLoginInitial,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const useAuthProvider = () => {
  const {
    user,
    loading,
    setUser,
    setLoading,
    isInitialized,
    setIsInitialized,
    refreshAuth: refreshAuth,

    handleLoginInitial: handleLoginInitial,

  } = useContext(AuthContext)

  return useMemo(() => ({
    user,
    loading,
    setUser,
    setLoading,
    isInitialized,
    setIsInitialized,
    refreshAuth,

    handleLoginInitial,
  }), [
    user,
    loading,
    setUser,
    setLoading,
    isInitialized,
    setIsInitialized,
    refreshAuth,

    handleLoginInitial
  ])
}
