import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import moment from "moment";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";

import {
  addOrder,
  setOrders,
  setOrderStatuses,
  setMovies,
  setSeats,
  setUsers,
  updateOrder,
} from "../reducerSlice";
import authHeader from "../../services/auth-header";

const Component = () => {
  const [status, setStatus] = useState("");
  const [movieId, setMovieId] = useState("");
  const [seatId, setSeatId] = useState("");
  const [userId, setUserId] = useState("");

  const apiBase = useSelector((state) => state.toolkit.apiBase);
  const movies = useSelector((state) => state.toolkit.movies);
  const seats = useSelector((state) => state.toolkit.seats);
  const orders = useSelector((state) => state.toolkit.orders);
  const orderStatuses = useSelector((state) => state.toolkit.orderStatuses);
  const users = useSelector((state) => state.toolkit.users);
  const dispatch = useDispatch();

  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterUser, setFilterUser] = useState("");

  const [filteredOrders, setFilteredOrders] = useState([]);
  const filterOrders = () => {
    if (!orders) return;

    if (!filterStatus && !filterDate && !filterUser) setFilteredOrders(orders);

    const date = moment(filterDate);

    const tmp = orders.filter((x) => {
      if (filterStatus && +x.status !== +filterStatus) return false;
      if (filterUser && +x.user_id !== +filterUser) return false;
      if (filterDate && !moment(x.updatedAt).isSame(date, "date")) return false;
      return true;
    });

    setFilteredOrders(tmp);
  };

  useEffect(() => {
    axios
      .get(`${apiBase}/orders?all=1`, { headers: authHeader() })
      .then((resp) => {
        dispatch(setOrders(resp.data));
        setFilterStatus("");
        setFilterDate("");
        setFilterUser("");
        setFilteredOrders(resp.data);
      });

    axios
      .get(`${apiBase}/orders/info/statuses`, { headers: authHeader() })
      .then((resp) => {
        dispatch(setOrderStatuses(resp.data));
      });

    axios.get(`${apiBase}/movies`, { headers: authHeader() }).then((resp) => {
      dispatch(setMovies(resp.data));
    });

    axios.get(`${apiBase}/seats`, { headers: authHeader() }).then((resp) => {
      dispatch(setSeats(resp.data));
    });

    axios.get(`${apiBase}/users`, { headers: authHeader() }).then((resp) => {
      dispatch(setUsers(resp.data));
    });
  }, [apiBase, dispatch]);

  const addNew = (e) => {
    e.preventDefault();

    axios
      .post(
        `${apiBase}/orders`,
        {
          status: +status,
          movie_id: +movieId,
          seat_id: +seatId,
          user_id: +userId,
        },
        { headers: authHeader() }
      )
      .then((resp) => {
        dispatch(addOrder(resp.data));
        setFilterStatus("");
        setFilterDate("");
        setFilterUser("");
        filterOrders();
      });
  };

  const [show, setShow] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const handleClose = () => setShow(false);
  const handleShow = (id) => {
    setSelectedId(id);
    setShow(true);
  };
  const handleSave = () => {
    const order = orders.find((x) => x.id === selectedId);

    if (!order) return;

    const o = { ...order };
    o.status = selectedStatus;

    axios
      .put(`${apiBase}/orders/${o.id}`, o, { headers: authHeader() })
      .then((resp) => {
        dispatch(updateOrder(o));
        handleClose();
        setFilterStatus("");
        setFilterDate("");
        setFilterUser("");
        filterOrders();
      });
  };

  return (
    <div className="mb-5 p-2 border border-top-0 rounded-bottom">
      <h3>???????????? ??????????????</h3>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>???????????? - ????????????</Form.Label>
            <Form.Select
              placeholder="???????????? ????????????"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                filterOrders();
              }}
              onBlur={(e) => {
                setFilterStatus(e.target.value);
                filterOrders();
              }}
            >
              <option value="">???? ??????????????</option>
              {orderStatuses &&
                orderStatuses.map((x) => (
                  <option key={x.val} value={x.val}>
                    {x.name}
                  </option>
                ))}
            </Form.Select>
            <Form.Text className="text-muted">???????????? ???????????? ????????????</Form.Text>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group className="mb-3">
            <Form.Label>???????????? - ????????</Form.Label>
            <Form.Control
              type="date"
              placeholder="????????"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                filterOrders();
              }}
              onBlur={(e) => {
                setFilterDate(e.target.value);
                filterOrders();
              }}
            ></Form.Control>
            <Form.Text className="text-muted">???????????? ???????????? ????????????</Form.Text>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group className="mb-3">
            <Form.Label>???????????? - ????????????????????????</Form.Label>
            <Form.Select
              placeholder="???????????????????????? (ID)"
              value={filterUser}
              onChange={(e) => {
                setFilterUser(e.target.value);
                filterOrders();
              }}
              onBlur={(e) => {
                setFilterUser(e.target.value);
                filterOrders();
              }}
            >
              <option value="">???? ??????????????</option>
              {users &&
                users.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.username} - {x.email}
                  </option>
                ))}
            </Form.Select>
            <Form.Text className="text-muted">
              ???????????????????????? - ???????????????? ???????????? ????????????
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {filteredOrders && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>????????????</th>
              <th>ID ????????????</th>
              <th>ID ??????????</th>
              <th>??????????????????????</th>
              <th>????????</th>
              <th>????????????????</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 &&
              filteredOrders.map((x) => {
                return (
                  <tr key={x.id}>
                    <td>{x.id}</td>
                    <td>
                      {orderStatuses &&
                        orderStatuses.find((e) => +e.val === +x.status)?.name}
                    </td>
                    <td>{x.movie_id}</td>
                    <td>{x.seat_id}</td>
                    <td>
                      {users &&
                        users.find((y) => +y.id === +x.user_id)?.username}
                    </td>
                    <td>{moment(x.updatedAt).format("DD-MM-YYYY hh:ss")}</td>
                    <td>
                      <Button
                        variant="outline-secondary"
                        onClick={() => handleShow(x.id)}
                      >
                        &#9998;
                      </Button>
                    </td>
                  </tr>
                );
              })}
            {!filteredOrders.length && (
              <tr>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <h3>???????????????? ?????????? ??????????</h3>

      <Form onSubmit={addNew}>
        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>????????????</Form.Label>
              <Form.Select
                name="status"
                placeholder="???????????? ????????????"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                onBlur={(e) => setStatus(e.target.value)}
              >
                <option disabled value="">
                  ???????????????? ????????????
                </option>
                {orderStatuses &&
                  orderStatuses.map((x) => (
                    <option key={x.val} value={x.val}>
                      {x.name}
                    </option>
                  ))}
              </Form.Select>
              <Form.Text className="text-muted">???????????? ???????????? ????????????</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>?????????? (ID)</Form.Label>
              <Form.Select
                name="movie_id"
                placeholder="?????????? (ID)"
                value={movieId}
                onChange={(e) => setMovieId(e.target.value)}
                onBlur={(e) => setMovieId(e.target.value)}
              >
                <option disabled value="">
                  ???????????????? ?????????? (ID)
                </option>
                {movies &&
                  movies.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
              </Form.Select>
              <Form.Text className="text-muted">???????????? ???????????? ????????????</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>?????????? (ID)</Form.Label>
              <Form.Select
                name="seat_id"
                placeholder="?????????? (ID)"
                value={seatId}
                onChange={(e) => setSeatId(e.target.value)}
                onBlur={(e) => setSeatId(e.target.value)}
              >
                <option disabled value="">
                  ???????????????? ?????????? (ID)
                </option>
                {seats &&
                  seats.map((x) => (
                    <option key={x.id} value={x.id}>
                      {`?????? ${x.hall} ?????? ${x.row} ?????????? ${x.number}`}
                    </option>
                  ))}
              </Form.Select>
              <Form.Text className="text-muted">???????????? ???????????? ????????????</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>????????????????????????</Form.Label>
              <Form.Select
                name="user_id"
                placeholder="???????????????????????? (ID)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onBlur={(e) => setUserId(e.target.value)}
              >
                <option disabled value="">
                  ???????????????? ???????????????????????? (ID)
                </option>
                {users &&
                  users.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.username} - {x.email}
                    </option>
                  ))}
              </Form.Select>
              <Form.Text className="text-muted">
                ???????????????????????? - ???????????????? ???????????? ????????????
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit">
          ????????????????
        </Button>
      </Form>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>????????????</Form.Label>
            <Form.Select
              name="status"
              placeholder="???????????? ????????????"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              onBlur={(e) => setSelectedStatus(e.target.value)}
            >
              <option disabled value="">
                ???????????????? ????????????
              </option>
              {orderStatuses &&
                orderStatuses.map((x) => (
                  <option key={x.val} value={x.val}>
                    {x.name}
                  </option>
                ))}
            </Form.Select>
            <Form.Text className="text-muted">???????????? ???????????? ????????????</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            ????????????
          </Button>
          <Button variant="primary" onClick={handleSave}>
            ??????????????????
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Component;
