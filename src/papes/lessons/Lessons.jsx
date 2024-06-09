import React, {useState, useEffect} from 'react';
import DashboardHeader from '../../components/DashboardHeader';

import { IconContext } from "react-icons";
import { AiFillLeftCircle, AiFillRightCircle } from "react-icons/ai";

import './styles.css';
import { deleteDataToRealTimeDB, editDataToRealTimeDB, readDataToRealTimeDB, writeDataToRealTimeDB } from '../../untils/DataHelper';
import ReactPaginate from 'react-paginate';
import { Link, useLocation } from 'react-router-dom';
const Lessons = () => {

  const [currentPage, setcurrentPage] = useState(1);
  const [editingLevel, setEditingLevel] = useState(null); 
  const [showModal, setShowModal] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPageData, setCurrentPageData] = useState([]);
  const itemsPerPage = 10; 
  //-------------------------------------------------//
  const [lessonsData, setLessonsData] = useState(null);
  const [topicId, setTopicId] = useState(null);
  
  const location = useLocation();
  const [lessons, setLessons] = useState({
    LessonSTT : 0, Name: '', NumRequired: 0 , IdTopic: topicId
  });  
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('topicId')
    setTopicId(id);
  }, [location.search]);

  useEffect(() => {
    setLessons(prevState => ({...prevState, IdTopic: topicId}));
  },[topicId]);

  useEffect(() => {
    if(topicId !== null) {
      readLessonsData();
    }
  }, [topicId]);
  useEffect(() => {
    if (lessonsData) {
        const dataKeys = Object.keys(lessonsData);
        const TotalPages = Math.ceil(dataKeys.length / itemsPerPage);
        setTotalPages(TotalPages);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentPageDataWithKeys = dataKeys.slice(startIndex, endIndex).map(key => ({
            key: key,
            ...lessonsData[key]
        }));
        setCurrentPageData(currentPageDataWithKeys);
    }
  }, [lessonsData, currentPage]);

  const handlePageClick = (event) => {
    setcurrentPage(event.selected + 1);
  }

  const readLessonsData = async () => {
    const data = await readDataToRealTimeDB('Lessons', (data) => {
      const filteredData = {};
      for (const key in data) {
          if (data[key].IdTopic === topicId) {
              filteredData[key] = data[key];
          }
      }
      setLessonsData(filteredData);
  });
  }
  
  const handleDataChange = (e) =>{
    const { name, value } = e.target;
    if(name === 'IdTopic'){
      setLessons(prevState => ({...prevState, IdTopic: value}));
    }else{
      setLessons(prevState => ({...prevState, [name]: value}));
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newDataKey = await writeDataToRealTimeDB('Lessons', lessons);
    console.log('New data key: ', newDataKey);
    setShowModal(false);
  }
  const handleEdit = async (idLesson) => {
    const lessonToUpdate = lessonsData[idLesson];
    setLessons(lessonToUpdate);
    setEditingLevel(idLesson);
    setShowModal(true);
  }
  const handleSaveEdit = async () => {
    await editDataToRealTimeDB(`Lessons/${editingLevel}`, lessons);
    setEditingLevel(null); 
    setLessons({ LessonSTT : 0, Name: '', NumRequired: 0 , IdTopic: topicId }); 
    setShowModal(false); 
  };
  
  const handleDelete = async (idLesson) => {
    try{
      await deleteDataToRealTimeDB(`Lessons/${idLesson}`);
      console.log("Lessons deleted successfully!");
    } catch(error) {
      console.error("Error deleting Lessons:", error);
    }
  }

  const handleCloseModal = () => {
    setLessons({ LessonSTT : 0, Name: '', NumRequired: 0 , IdTopic: topicId }); 
    setShowModal(false);
} 

  return (
    <div className='dashboard-content'>
  <DashboardHeader
      btnText="New Order"
      onClick={() => setShowModal(true)} />

  <div className='dashboard-content-container'>
      <div className='dashboard-content-header'>
          <h2>LESSONS</h2>
          <div className='dashboard-content-search'>
              <input
                  type='text'
                  placeholder='Search..'
                  className='dashboard-content-input'
                  //onChange={e => __handleSearch(e)} 
                  />
          </div>
      </div>

      <table>
          <thead>
              <tr>
                <th>STT</th>
                <th>NAME</th>
                <th>NUMREQUIED</th>
              </tr>
          </thead>

          {currentPageData.length > 0 ?
              <tbody>
                  {currentPageData.map((item, index) => (
                      <tr key={index} className='hovers'>
                          <td>{item.LessonSTT}</td>
                          <td>{item.Name}</td>
                          <td>{item.NumRequired}</td>
                          <td>
                              <Link to={`/quizzs?lessonId=${item.key}`}>Chi tiết </Link>
                              <button onClick={() => handleEdit(item.key)}> Edit</button>
                              <button onClick={() => handleDelete(item.key)}> Delete</button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          : null}
      </table>

      {showModal && (
        <div className='modal-main'>
          <div class="modal-content dashboard-content-container">
            <form onSubmit={handleSubmit}>
              <input type='number' name='LessonSTT' placeholder='Số thứ tự ' value={lessons.LessonSTT} onChange={handleDataChange} required />
              <input type='text' name='Name' placeholder='Tên Lessson' value={lessons.Name} onChange={handleDataChange} required  />
              <input type='text' name='NumRequired' placeholder='Số Lesson trong Topic' value={lessons.NumRequired} onChange={handleDataChange} required />
              
              <button type='submit'>Submit</button>
            </form>
              <button onClick={handleCloseModal} className="btn btn-secondary">Close</button>
          </div>
        </div>
      )}

      {lessonsData !== null ?
      <div className='dashboard-content-footer'>
          <ReactPaginate
          containerClassName={"pagination"}
          pageClassName={"page-item"}
          activeClassName={"active"}
          onPageChange={handlePageClick}
          pageCount={totalPages}
          breakLabel="..."
          previousLabel={
            <IconContext.Provider value={{ color: "#B8C1CC", size: "36px" }}>
              <AiFillLeftCircle />
            </IconContext.Provider>
          }
          nextLabel={
            <IconContext.Provider value={{ color: "#B8C1CC", size: "36px" }}>
              <AiFillRightCircle />
            </IconContext.Provider>
          }
        />
        </div>
      : 
          <div className='dashboard-content-footer'>
              <span className='empty-table'>No data</span>
          </div>
      }
  </div>
</div>
);
};

export default Lessons