/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, type FormEvent } from "react";
import "./home.css";
import axios from "axios";
import { Apis } from "../../../apis";
import type { user } from "../../../types/user.type";
import { BackTop } from "antd"; // Nếu không dùng có thể comment lại
import { useSelector } from "react-redux";
import type { StoreType } from "../../../stores";

export default function AdminContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedBg, setSelectedBg] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<any[]>([]);
  const [workSpace, setWorkSpace] = useState([]);
  const [article, setArticle] = useState([]);
  const [userData, setUserData] = useState<user | null>(null);
  const [titleEdit, setTitleEdit] = useState("");
  const [error, setError] = useState("");
  // THÊM: State để kích hoạt useEffect chạy lại
  const [refreshFlag, setRefreshFlag] = useState(false);

  const colors = [
    "#FF7B00",
    "#8B00FF",
    "#00FF85",
    "#00C2FF",
    "#FFE500",
    "#FF007F",
  ];

  async function getUserData() {
    try {
      const res = await Apis.user.me(localStorage.getItem("token"));
      console.log(res);
      if ((res as user).role !== "admin") {
        window.location.href = "/";
      } else {
        setUserData(res as any);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu người dùng", error);
    }
  }

  async function getCourses() {
    try {
      const res = await axios.get(`${import.meta.env.VITE_SV_HOST}/courses`);
      if (!userData) return;
      setCourseData(res.data);
      setWorkSpace(res.data.filter((course: any) => course.type !== "article"));
      setArticle(
        res.data.filter((course: any) => course.type === "article")
      );
      console.log("Danh sách khóa học:", res.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu khóa học", error);
    }
  }

  useEffect(() => {
    getUserData();
  }, []);

  // SỬA: Thêm refreshFlag vào dependency array
  useEffect(() => {
    if (userData) getCourses();
  }, [userData, refreshFlag]);

  // --- CREATE COURSE ---
  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const newData = {
      title: (e.target as any).title.value,
      backdrop: "/imgs/background.png",
      type: "course",
    };
    if (newData.title.trim() == "") {
      setError("Please input a valid Course Name");
    } else {
      setError("");
      await Apis.course.createCourse(newData);
      await getCourses();
      setIsOpen(false);
      // THÊM: Kích hoạt render bằng cách thay đổi refreshFlag
      setRefreshFlag(!refreshFlag); 
      // Reset trạng thái sau khi tạo thành công
      setSelectedBg(null);
    }
  }

  // --- EDIT COURSE ---
  async function handleEdit(e: FormEvent) {
    e.preventDefault();
    const newTitle = (e.target as any).editTitle.value;

    if (newTitle.trim() == "") {
      setError("Please input a valid Course Name");
    } else {
      setError("");
      await axios.patch(`${import.meta.env.VITE_SV_HOST}/courses/` + editId, {
        title: newTitle,
        backdrop: selectedBg,
      });
      await getCourses();
      setIsEditOpen(false);
      setEditId(null);
      setSelectedBg(null);
      // THÊM: Kích hoạt render bằng cách thay đổi refreshFlag
      setRefreshFlag(!refreshFlag); 
    }
  }

  // --- DELETE COURSE ---
  async function handleDelete() {
    if (!editId) return;

    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_SV_HOST}/courses/` + editId);
      await getCourses();
      setIsEditOpen(false);
      setEditId(null);
      setError("");
      setSelectedBg(null);
      setSelectedColor(null);
      // THÊM: Kích hoạt render bằng cách thay đổi refreshFlag
      setRefreshFlag(!refreshFlag); 
    } catch (error) {
      console.error("Lỗi khi xóa khóa học", error);
      setError("Error deleting the course.");
    }
  }

  return (
    <div id="BoardContent">
      <main>
        <div className="title">
          <h1>
            <i className="fa-solid fa-graduation-cap"></i> Your Courses
          </h1>
        </div>
        <div className="line"></div>
        <div className="cardList">
          {workSpace.map((course: any) => (
            <div
              key={course.id}
              className="boardCard"
              onClick={() => (window.location.href = `/admin/${course.id}`)}
              style={{ cursor: "pointer" }}
            >
              <img src={course.backdrop} alt="Course background" />
              <h3 className="cardTitle">{course.title}</h3>
              <button
                className="editBtn"
                onClick={(e) => {
                  e.stopPropagation(); // 🔥 chặn click lan lên div cha
                  setIsEditOpen(true);
                  setEditId(course.id);
                  setTitleEdit(course.title);
                  setSelectedBg(course.backdrop);
                }}
              >
                Edit
              </button>
            </div>
          ))}

          <div id="addCard">
            <button type="button" onClick={() => setIsOpen(true)}>
              + Create New Course
            </button>
          </div>
        </div>
        <div id="title">
          <h1>
            <i className="fa-regular fa-star"></i>Starred Courses
          </h1>
        </div>
        <div className="line"></div>
        <div className="cardList">
          {article.map((course: any) => (
            <div
              key={course.id}
              className="boardCard"
              onClick={() => (window.location.href = `/home/${course.id}`)}
              style={{ cursor: "pointer" }}
            >
              <img src={course.backdrop} alt="Course background" />
              <h3 className="cardTitle">{course.title}</h3>
              <button
                className="editBtn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditOpen(true);
                  setEditId(course.id);
                  setTitleEdit(course.title);
                  setSelectedBg(course.backdrop);
                }}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* --- MODAL CREATE COURSE (UPDATED) --- */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "999",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: "white",
              padding: "50px",
              borderRadius: "8px",
              minWidth: "498px",
            }}
          >
            <div className="rowFlex">
              <h3 style={{ display: "inline" }}>Create New Course</h3>
              <p
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setError("");
                  setIsOpen(false);
                  setSelectedBg(null);
                  setSelectedColor(null);
                }}
              >
                X
              </p>
            </div>

            <div className="line"></div>

            <form onSubmit={handleCreate}>
              <h3>Course Name</h3>
              <input
                type="text"
                name="title"
                placeholder="E.g. Introduction to ReactJS"
              ></input>
              <p style={{ fontSize: "12px", marginTop: "5px" }}>
                👋 Please provide a valid course name
              </p>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <div className="line"></div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "right",
                  alignItems: "right",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  className="closeBtn"
                  onClick={() => {
                    setError("");
                    setIsOpen(false);
                    setSelectedBg(null);
                    setSelectedColor(null);
                  }}
                >
                  Close
                </button>
                <button type="submit" className="actionBtn">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT COURSE (UPDATED) --- */}
      {isEditOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "999",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: "white",
              padding: "50px",
              borderRadius: "8px",
              minWidth: "498px",
            }}
          >
            <div className="rowFlex">
              <h3 style={{ display: "inline" }}>Update Course</h3>
              <p
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setError("");
                  setIsEditOpen(false);
                  setSelectedBg(null);
                  setSelectedColor(null);
                }}
              >
                X
              </p>
            </div>

            <div className="line"></div>

            <form onSubmit={handleEdit}>
              <h3>Course Name</h3>
              <input
                type="text"
                value={titleEdit}
                onChange={(e) => setTitleEdit(e.target.value)}
                name="editTitle"
                placeholder="E.g. Advanced TypeScript"
              ></input>
              <p style={{ fontSize: "12px", marginTop: "5px" }}>
                👋 Update the course name below.
              </p>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <div className="line"></div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between", // Căn chỉnh các nút
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {/* Nút Xóa (Delete) */}
                <button
                  type="button"
                  className="actionBtn" // Sử dụng actionBtn hoặc tạo class mới cho Delete
                  style={{ backgroundColor: "#ff4d4f" }} // Màu đỏ cho nút Delete
                  onClick={handleDelete}
                >
                  Delete
                </button>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="closeBtn"
                    onClick={() => {
                      setError("");
                      setIsEditOpen(false);
                      setSelectedBg(null);
                      setSelectedColor(null);
                    }}
                  >
                    Close
                  </button>
                  <button type="submit" className="actionBtn">
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}