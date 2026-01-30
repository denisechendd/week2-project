import { useCallback, useEffect, useState } from "react";
// import "./assets/style.css"; // 確保此檔案存在，否則會報錯
import axios from 'axios';

function App() {
  const url = import.meta.env.VITE_URL;
  const path = import.meta.env.VITE_PATH;

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. 初始化 Token
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
    }
  }, []);

  // 2. 取得產品清單 (使用 useCallback 穩定參考)
  const getProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/${path}/admin/products`);
      setProducts(response.data.products);
    } catch (error) {
      console.dir(error);
    }
  }, [url, path]);

  // 3. 檢查登入狀態
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await axios.post(`${url}/api/user/check`);
        // 修正點：response 名稱一致
        if (response.data.success) {
          setIsAuth(true);
          await getProducts();
        }
      } catch (err) {
        setIsAuth(false);
        console.dir(err);
      } finally {
        setIsLoading(false);
      }
    };
    checkLogin();
  }, [url, getProducts]);

  // 4. 處理輸入變更 (移出 handleSubmit)
  const handleInputChange = (e) => {
    const { value, id } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // 5. 處理登入提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 確保 API URL 正確
      const res = await axios.post(`${url}/admin/signin`, formData);
      const { token, expired } = res.data;

      document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;
      axios.defaults.headers.common["Authorization"] = token;

      setFormData({ username: "", password: "" });
      setIsAuth(true);
      await getProducts();
    } catch (err) {
      setIsAuth(false);
      alert("登入失敗，請檢查帳號密碼");
      console.dir(err);
    }
  }; // 修正點：補上 handleSubmit 的閉合括號

  // 6. 載入中狀態回傳 (置於組件層級)
  if (isLoading) {
    return <p className="text-center mt-5">載入中...</p>;
  }

  return (
    <>
      {isAuth ? (
        <div className="container">
          <div className="row mt-5">
            <div className="col-md-6">
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products && products.length > 0 ? (
                    products.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.origin_price}</td>
                        <td>{item.price}</td>
                        <td>{item.is_enabled ? "啟用" : "未啟用"}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => setTempProduct(item)}
                          >
                            查看細節
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">尚無產品資料</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2>單一產品細節</h2>
              {tempProduct ? (
                <div className="card mb-3">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top primary-image"
                    alt={tempProduct.title}
                    style={{ height: '300px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge bg-primary ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">
                      商品描述：{tempProduct.description}
                    </p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <p className="card-text text-secondary me-2">
                        <del>{tempProduct.origin_price}</del>
                      </p>
                      {tempProduct.price} 元
                    </div>
                    <h5 className="mt-3">更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl?.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          className="images me-2 mb-2"
                          alt={`sub-img-${index}`}
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="container login py-5">
          <div className="row justify-content-center">
            <div className="col-md-4">
              <h1 className="h3 mb-3 font-weight-normal text-center">請先登入</h1>
              <form id="form" className="form-signin" onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="username"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    autoFocus
                  />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button
                  className="btn btn-lg btn-primary w-100 mt-3"
                  type="submit"
                >
                  登入
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;