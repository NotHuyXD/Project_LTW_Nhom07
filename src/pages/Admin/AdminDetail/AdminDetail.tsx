/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type FormEvent } from "react";
import "./BoardDetail.css";
import axios from "axios";
import { useParams } from "react-router";
import type { session as SessionType } from "../../../types/session.type"; 
import type { lesson as LessonType } from "../../../types/lesson.type"; 
import type { course as CourseType } from "../../../types/course.type"; 
import "react-quill-new/dist/quill.snow.css";
import ReactQuill from "react-quill-new";

export default function AdminDetail() {
  const dynamicData = useParams();
  const courseId = dynamicData.courseId;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null); 
  const [sessionDeleteModal, setSessionDeleteModal] = useState(false); 
  
  const [status, setStatus] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<CourseType | null>(null);
  const [sessionData, setSessionData] = useState<SessionType[] | null>(null);
  const [lessonData, setLessonData] = useState<LessonType[]>([]);

  const [openFilter, setOpenFilter] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [closeBoard, setCloseBoard] = useState(false);
  const [sessionModal, setSessionModal] = useState(false);
  const [lessonModal, setLessonModal] = useState(false);
  const [moveModal, setMoveModal] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  
  const [selectedListValue, setSelectedListValue] = useState<string | null>(
    null
  );
  const [lessonDetailModal, setLessonDetailModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonType | null>(null);
  
  const [descriptionValue, setDescriptionValue] = useState("");
  const [error, setError] = useState("");

  async function getCourseData() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SV_HOST}/courses/` + courseId 
      );
      setCourseData(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function getSessionData() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SV_HOST}/sessions?courseId=` + courseId 
      );
      setSessionData(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function getLessonData() {
    const res = await axios.get(`${import.meta.env.VITE_SV_HOST}/lessons`);
    setLessonData(res.data);
  }

  function closeAllModals() {
    setOpenFilter(false);
    setDeleteModal(false);
    setCloseBoard(false);
    setSessionModal(false);
    setLessonModal(false);
    setMoveModal(false);
    setLessonDetailModal(false);
    setSessionDeleteModal(false); 
  }

  useEffect(() => {
    getCourseData();
    getSessionData(); 
    getLessonData();
  }, [courseId]);

  function renderLessonsBySession(sessionId: string) {
    const lessons = lessonData.filter((t: any) => t.sessionId === sessionId); 
    
    return lessons.map((t) => (
      <div
        key={t.id}
        className="taskItem"
        onClick={() => {
          setSelectedLesson(t);
          setDescriptionValue(t.content || "");
          setLessonDetailModal(true);
          setStatus(sessionData?.find((list) => list.id === t.sessionId)?.title); 
        }}
        style={{ cursor: "pointer" }}
      >
        <p>{t.title}</p>
      </div>
    ));
  }

  async function createSession(e: FormEvent) {
    e.preventDefault();
    const newList = {
      courseId: courseId, 
      title: (e.target as any).listTitle.value,
    };
    if (newList.title == "") {
      setError("Please input session title");
    } else {
      setError("");
      await axios.post(`${import.meta.env.VITE_SV_HOST}/sessions`, newList); 
      await getSessionData(); 
      setSessionModal(false); 
    }
  }

  async function createLesson(e: FormEvent) {
    e.preventDefault();
    
    if (sessionId === null) return;

    // SỬA: Loại bỏ Number() - sessionId là string
    const newTask = {
      sessionId: sessionId, 
      title: (e.target as any).taskTitle.value,
      content:""
    };
    if (newTask.title == "") {
      setError("Please input lesson title");
    } else {
      setError("");
      await axios.post(`${import.meta.env.VITE_SV_HOST}/lessons`, newTask);
      await getLessonData();
      setLessonModal(false);
    }
  }

  async function changeStarred() {
    await axios.patch(`${import.meta.env.VITE_SV_HOST}/courses/` + courseId, { 
      type: courseData?.type=="article" ? "course" : "article", 
    });
  }

  async function handleDeleteSession() {
    if (!sessionToDelete) return;

    try {
      await axios.delete(`${import.meta.env.VITE_SV_HOST}/sessions/` + sessionToDelete);
      await getSessionData();
      closeAllModals();
      setSessionToDelete(null);
    } catch (err) {
      console.log(err);
      setError("Error deleting session.");
    }
  }
  
  async function handleMoveLesson() {
    if (!selectedLesson || !selectedListValue) return;

    const newSession = sessionData?.find(s => s.title === selectedListValue);
    if (!newSession) return;
    
    const newSessionId = newSession.id;
    
    try {
        await axios.patch(`${import.meta.env.VITE_SV_HOST}/lessons/${selectedLesson.id}`, {
            sessionId: newSessionId,
        });

        setSelectedLesson(prev => prev ? { ...prev, sessionId: newSessionId } : null);
        await getLessonData();
        setMoveModal(false);
    } catch (error) {
        console.error("Lỗi khi chuyển bài học:", error);
    }
  }


  return (
    <div id="boardDetail">
      <div id="titleBar">
        <div id="left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <h1>{courseData?.title}</h1> 
             <i
              className={
                courseData?.type==="article" ? "fa-solid fa-star" : "fa-regular fa-star" 
              }
              onClick={async () => {
                await changeStarred();
                await getCourseData(); 
                console.log(courseData);
              }}
              style={{ cursor: 'pointer' }}
            ></i>
          </div>
        </div>
      </div>
      <div id="taskList">
        {sessionData?.map((sessionItem) => ( 
          <div key={sessionItem.id} className="taskCard">
            <div className="headCard">
              <p>{sessionItem.title}</p> 
              <p 
                 onClick={() => {
                   setSessionToDelete(sessionItem.id);
                   setSessionDeleteModal(true);
                 }}
                 style={{ cursor: "pointer", fontWeight: "bold" }}
              >
                ...
              </p>
            </div>

            {renderLessonsBySession(sessionItem.id)} 

            <div className="headCard">
              <p
                onClick={() => {
                  setLessonModal(true);
                  setSessionId(sessionItem.id); 
                }}
                style={{ cursor: "pointer" }}
              >
                + Add a lesson
              </p> 
              <img
                src="/imgs/buttonCard.png"
                style={{ width: "32px", height: "32px", cursor: "pointer" }}
                onClick={() => {
                   setSessionToDelete(sessionItem.id);
                   setSessionDeleteModal(true);
                }}
              />
            </div>
          </div>
        ))}

        <div id="addList" style={{ cursor: "pointer" }} onClick={() => setSessionModal(true)}> 
          <h5>+ Add another session</h5> 
        </div>
      </div>

      {lessonDetailModal && selectedLesson && ( 
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
            zIndex: "997",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "30px",
              width: "850px",
              maxHeight: "90vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              className="rowFlex"
              style={{ justifyContent: "space-between" }}
            >
              <h2>{selectedLesson.title}</h2> 
              <p
                style={{ cursor: "pointer", fontWeight: "bold" }}
                onClick={() => {
                  setStatus(null);
                  setLessonDetailModal(false); 
                }}
              >
                X
              </p>
            </div>
            <div
              className="rowFlex"
              style={{ justifyContent: "left", alignItems: "center" }}
            >
              <h5>In Session:</h5> 
              <p
                style={{
                  border: "1px solid gray",
                  borderRadius: "6px",
                  padding: "6px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setSelectedListValue(
                    sessionData?.find((list) => list.id === selectedLesson.sessionId)?.title
                  );
                  setMoveModal(true);
                }}
              >
                {sessionData?.find((list) => list.id === selectedLesson.sessionId)?.title || 'N/A'}
              </p>
            </div>

            <div className="rowFlex">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "30px",
                }}
              >
                <p style={{ fontWeight: "bold" }}>Content</p> {/* ĐỔI: Description thành Content */}
                <ReactQuill
                  theme="snow"
                  value={descriptionValue}
                  onChange={setDescriptionValue}
                  placeholder="Enter lesson content..." 
                  style={{
                    width: "600px",
                    height: "200px",
                    marginBottom: "20px",
                    background: "white",
                  }}
                  // CẤU HÌNH TOOLBAR ĐỂ HỖ TRỢ VIDEO
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link", "image", "video"], // Thêm 'video'
                      ["clean"],
                    ],
                  }}
                />
                <div
                  className="rowFlex"
                  style={{ gap: "10px", justifyContent: "left" }}
                >
                  <button
                    type="button"
                    style={{
                      backgroundColor: "#3085d6",
                      color: "white",
                      borderRadius: "8px",
                      border: "0",
                      padding: "12px 24px",
                      cursor: "pointer",
                    }}
                    onClick={async () => {
                      // GỬI HTML content (bao gồm video iframe)
                      await axios.patch(
                        `${import.meta.env.VITE_SV_HOST}/lessons/${
                          selectedLesson.id 
                        }`,
                        {
                          content: descriptionValue, // LƯU CHUỖI HTML TỪ QUILl
                        }
                      );
                      await getLessonData(); 
                      setLessonDetailModal(false); 
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    style={{
                      backgroundColor: "#ddd",
                      color: "#333",
                      borderRadius: "8px",
                      border: "0",
                      padding: "12px 24px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setStatus(null);
                      setLessonDetailModal(false); 
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    borderRadius: "6px",
                    width: "168px",
                    border: "0",
                    textAlign: "left",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  onClick={() => { /* setDateModal(true) */} }
                >
                  <img
                    src="../src/imgs/dateButton.png"
                    style={{ width: "150px", height: "40px" }}
                  />
                </div>
                <div
                  style={{
                    borderRadius: "6px",
                    width: "168px",
                    border: "0",
                    textAlign: "left",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  onClick={() => {
                    setDeleteModal(true);
                  }}
                >
                  <img
                    src="../src/imgs/deleteButton.png"
                    style={{ width: "150px", height: "40px" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FILTER MODAL (Giữ nguyên) --- */}
      {openFilter && (
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
              padding: "20px",
              borderRadius: "8px",
              minWidth: "498px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <p>Filter Lessons</p>
            <form
              style={{ display: "flex", flexDirection: "column", gap: "1px" }}
            >
              <div className="rowFlex">
                <h5>Keyword</h5>
                <p
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setOpenFilter(false);
                  }}
                >
                  X
                </p>
              </div>
              <input type="text" name="lessonName"></input>
              <p>Search lessons</p>
              <h5>Lesson Status</h5>
              <div className="rowFlex" style={{ justifyContent: "left" }}>
                <input
                  type="checkbox"
                  name="status"
                  checked={statusFilter === "completed"}
                  onClick={() => {
                    setStatusFilter(
                      statusFilter === "completed" ? null : "completed"
                    );
                  }}
                ></input>
                <p>Mark as completed</p>
              </div>
              <div className="rowFlex" style={{ justifyContent: "left" }}>
                <input
                  type="checkbox"
                  name="status"
                  checked={statusFilter === "incompleted"}
                  onClick={() => {
                    setStatusFilter(
                      statusFilter === "incompleted" ? null : "incompleted"
                    );
                  }}
                ></input>
                <p>Not mark as completed</p>
              </div>
              <h5>Due Date</h5>
              <div className="rowFlex" style={{ justifyContent: "left" }}>
                <input
                  type="checkbox"
                  name="date"
                  checked={dateFilter === "noDate"}
                  onClick={() => {
                    setDateFilter(dateFilter === "noDate" ? null : "noDate");
                  }}
                ></input>
                <p>No dates</p>
              </div>
              <div className="rowFlex" style={{ justifyContent: "left" }}>
                <input
                  type="checkbox"
                  name="date"
                  checked={dateFilter === "overdue"}
                  onClick={() => {
                    setDateFilter(dateFilter === "overdue" ? null : "overdue");
                  }}
                ></input>
                <p>Overdue</p>
              </div>
              <div className="rowFlex" style={{ justifyContent: "left" }}>
                <input
                  type="checkbox"
                  name="date"
                  checked={dateFilter === "nextDay"}
                  onClick={() => {
                    setDateFilter(dateFilter === "nextDay" ? null : "nextDay");
                  }}
                ></input>
                <p>Due in next day</p>
              </div>
              <h5>Labels</h5>
              <div className="rowFlex" style={{ justifyContent: "left" }}>
                <input
                  type="checkbox"
                  name="label"
                  onClick={() => {
                    
                  }}
                ></input>
                <p>No labels</p>
              </div>
              <div
                className="rowFlex"
                style={{ justifyContent: "left", marginTop: "10px" }}
              >
                <input
                  type="checkbox"
                  name="label"
                  onClick={() => {
                    
                  }}
                ></input>
                <div
                  className="label"
                  style={{ backgroundColor: "green" }}
                ></div>
              </div>
              <div
                className="rowFlex"
                style={{ justifyContent: "left", marginTop: "10px" }}
              >
                <input
                  type="checkbox"
                  name="label"
                  onClick={() => {
                    
                  }}
                ></input>
                <div className="label" style={{ backgroundColor: "red" }}></div>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && selectedLesson && (
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
              alignItems: "center",
              background: "white",
              padding: "50px",
              borderRadius: "8px",
              minWidth: "498px",
            }}
          >
            <img
              src="../src/imgs/warning.png"
              style={{ width: "88px", height: "88px" }}
            />
            <h1>Are you sure?</h1> <p>You won't be able to revert this</p>
            <div className="rowFlex">
              <button
                type="button"
                style={{
                  backgroundColor: "#3085d6",
                  color: "white",
                  borderRadius: "8px",
                  border: "0",
                  padding: "20px",
                  cursor: "pointer",
                }}
                onClick={async () => {
                  await axios.delete(
                    `${import.meta.env.VITE_SV_HOST}/lessons/` + selectedLesson.id 
                  );
                  await getLessonData(); 
                  closeAllModals();
                }}
              >
                Yes, delete it!
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteModal(false);
                }}
                style={{
                  backgroundColor: "#dd3333",
                  color: "white",
                  borderRadius: "8px",
                  border: "0",
                  padding: "20px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- NEW: DELETE SESSION MODAL --- */}
      {sessionDeleteModal && (
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
              alignItems: "center",
              background: "white",
              padding: "50px",
              borderRadius: "8px",
              minWidth: "498px",
            }}
          >
            <img
              src="/imgs/warning.png"
              style={{ width: "88px", height: "88px" }}
            />
            <h1>Delete Session?</h1> <p>This will delete the entire session and its lessons.</p>
            {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
            <div className="rowFlex" style={{ marginTop: "20px", gap: "10px" }}>
              <button
                type="button"
                style={{
                  backgroundColor: "#dd3333",
                  color: "white",
                  borderRadius: "8px",
                  border: "0",
                  padding: "12px 20px",
                  cursor: "pointer",
                }}
                onClick={handleDeleteSession}
              >
                Yes, delete it!
              </button>
              <button
                type="button"
                onClick={() => setSessionDeleteModal(false)}
                style={{
                  backgroundColor: "#ddd",
                  color: "#333",
                  borderRadius: "8px",
                  border: "0",
                  padding: "12px 20px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {closeBoard && (
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
              alignItems: "center",
              background: "white",
              padding: "50px",
              borderRadius: "8px",
              minWidth: "498px",
            }}
          >
            <img
              src="../src/imgs/warning.png"
              style={{ width: "88px", height: "88px" }}
            />
            <h1>Are you sure?</h1> <p>You won't be able to revert this</p>
            <div className="rowFlex">
              <button
                type="button"
                style={{
                  backgroundColor: "#3085d6",
                  color: "white",
                  borderRadius: "8px",
                  border: "0",
                  padding: "20px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  window.location.href = "/home";
                }}
              >
                Yes, close it!
              </button>
              <button
                type="button"
                onClick={() => {
                  setCloseBoard(false);
                }}
                style={{
                  backgroundColor: "#dd3333",
                  color: "white",
                  borderRadius: "8px",
                  border: "0",
                  padding: "20px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {sessionModal && (
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
              alignItems: "center",
              background: "white",
              padding: "50px",
              borderRadius: "8px",
              minWidth: "498px",
            }}
          >
            <form
              onSubmit={createSession}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <h1>Create new session</h1>
              <input type="text" name="listTitle"></input>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <div className="rowFlex">
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#3085d6",
                    color: "white",
                    borderRadius: "8px",
                    border: "0",
                    padding: "20px",
                    cursor: "pointer",
                  }}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSessionModal(false);
                    setError("");
                  }}
                  style={{
                    backgroundColor: "#dd3333",
                    color: "white",
                    borderRadius: "8px",
                    border: "0",
                    padding: "20px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lessonModal && (
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
              alignItems: "center",
              background: "white",
              padding: "50px",
              borderRadius: "8px",
              minWidth: "498px",
            }}
          >
            <form
              onSubmit={createLesson}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <h1>Create new lesson</h1>
              <input type="text" name="taskTitle"></input>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <div className="rowFlex">
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#3085d6",
                    color: "white",
                    borderRadius: "8px",
                    border: "0",
                    padding: "20px",
                    cursor: "pointer",
                  }}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLessonModal(false);
                    setError("");
                  }}
                  style={{
                    backgroundColor: "#dd3333",
                    color: "white",
                    borderRadius: "8px",
                    border: "0",
                    padding: "20px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
              </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {moveModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "998",
            backdropFilter: "blur(3px)",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "10px",
              padding: "30px",
              width: "400px",
              maxHeight: "80vh",
              overflowY: "auto",
              animation: "fadeIn 0.2s ease-in-out",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="rowFlex"
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2>Move Lesson</h2>
              <p
                style={{ cursor: "pointer", fontWeight: "bold" }}
                onClick={() => {
                  setMoveModal(false);
                }}
              >
                ✕
              </p>
            </div>
            <p>Select destination</p>
            <h2>Course</h2>
            <p
              style={{
                border: "1px solid black",
                borderRadius: "6px",
                width: "380px",
                padding: "10px",
              }}
            >
              {courseData?.title}
            </p>
            <div className="rowFlex">
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h2>Session</h2>
                <select
                  name="statusValue"
                  value={selectedListValue || ""}
                  onChange={(e) => {
                    setSelectedListValue(e.target.value);
                  }}
                  style={{
                    borderRadius: "6px",
                    width: "250px",
                    padding: "10px",
                  }}
                >
                  {sessionData?.map((session) => ( 
                    <option key={session.id} value={session.title}>
                      {session.title}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h2>Position</h2>
                <select
                  style={{
                    borderRadius: "6px",
                    width: "100px",
                    padding: "10px",
                  }}
                  value={selectedLesson?.id}
                ></select>
              </div>
              <button
                type="button"
                style={{
                  padding: "10px",
                  textAlign: "center",
                  borderRadius: "8px",
                  border: "0",
                  cursor: "pointer",
                  backgroundColor: "#0c66e4",
                  color: "white",
                  width: "100px",
                }}
                onClick={handleMoveLesson} 
              >
                Save Move
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}