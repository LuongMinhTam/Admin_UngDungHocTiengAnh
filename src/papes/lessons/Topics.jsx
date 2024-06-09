import React, {useState, useEffect} from 'react';
import DashboardHeader from '../../components/DashboardHeader';

import { IconContext } from "react-icons";
import { AiFillLeftCircle, AiFillRightCircle } from "react-icons/ai";

import './styles.css';
import { deleteDataToRealTimeDB, editDataToRealTimeDB, readDataToRealTimeDB, writeDataToRealTimeDB } from '../../untils/DataHelper';
import ReactPaginate from 'react-paginate';
import { Link, useLocation } from "react-router-dom";
import { Modal, Button, Form } from 'react-bootstrap';

const Topics = () => {

    const [currentPage, setcurrentPage] = useState(1);
    const [editingLevel, setEditingLevel] = useState(null); 
    const [showModal, setShowModal] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPageData, setCurrentPageData] = useState([]);
    const itemsPerPage = 10; 
    //-------------------------------------------------//
    const [levelId, setLevelId] = useState(null);
    const [topics, setTopics] = useState({
      Id_Levels: levelId, TopicSTT : 0, Name : '', Description: '', numRequired: 0
    });
    const [topicsData, setTopicsData] = useState(null);
    const location = useLocation();

    //Lấy id level
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const id = searchParams.get('levelId');
        setLevelId(id);
    }, [location.search]);

    //Hiển thị topic thuộc id level
    useEffect(() => {
      setTopics(prevState => ({...prevState, Id_Levels: levelId}));
    }, [levelId])

    useEffect(() => {
      if (levelId !== null) {
        readTopicsData();
    }
    }, [levelId]);
    
      useEffect(() => {
        if (topicsData) {
            const dataKeys = Object.keys(topicsData); // Lấy ra danh sách các khóa từ levelsData
            const TotalPages = Math.ceil(dataKeys.length / itemsPerPage);
            setTotalPages(TotalPages);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentPageDataWithKeys = dataKeys.slice(startIndex, endIndex).map(key => ({
                key: key,
                ...topicsData[key]
            }));
            setCurrentPageData(currentPageDataWithKeys);
        }
    }, [topicsData, currentPage]);

    const handlePageClick = (event) => {
      setcurrentPage(event.selected + 1);
  }

  const readTopicsData = async () => {
    const data = await readDataToRealTimeDB('Topics', (data) => {
        const filteredData = {};
        for (const key in data) {
            if (data[key].Id_Levels === levelId) {
                filteredData[key] = data[key];
            }
        }
        setTopicsData(filteredData);
    });
}

    const handleDataChange = (e) => {
        const {name, value} = e.target;
        if(name === 'Id_Levels'){
          setTopics(prevState => ({...prevState, Id_Levels: value}))
        }else{
          setTopics(prevState => ({...prevState , [name]: value}));
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newDataKey = await writeDataToRealTimeDB('Topics', topics);
        console.log(newDataKey);
        setShowModal(false);
    }

    const handleEdit = async (idTopic) => {
      const topicToUpdate = topicsData[idTopic];
      setTopics(topicToUpdate);
      setEditingLevel(idTopic);
      setShowModal(true);
    }
  
    const handleSaveEdit = async () => {
      await editDataToRealTimeDB(`Topics/${editingLevel}`, topics);
      setEditingLevel(null); 
      setTopics({ Id_Levels: levelId, TopicSTT : 0, Name : '', Description: '', numRequired: 0 }); 
      setShowModal(false); 
    };
    
    const handleDelete = async (idTopic) => {
      try{
        await deleteDataToRealTimeDB(`Topics/${idTopic}`);
        console.log("Levels deleted successfully!");
      } catch(error) {
        console.error("Error deleting levels:", error);
      }
    }

    const handleCloseModal = () => {
      setTopics({ Id_Levels: levelId, TopicSTT : 0, Name : '', Description: '', numRequired: 0 }); 
      setShowModal(false);
  }   

return (
  <div className='dashboard-content'>
  <DashboardHeader
      btnText="New Order"
      onClick={() => setShowModal(true)} />

  <div className='dashboard-content-container'>
      <div className='dashboard-content-header'>
          <h2>TOPICS</h2>
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
                <th>DESCRIPTION</th>
                <th>NUMREQUIED</th>
              </tr>
          </thead>

          {currentPageData.length > 0 ?
              <tbody>
                  {currentPageData.map((item, index) => (
                      <tr key={index} className='hovers'>
                          <td>{item.TopicSTT}</td>
                          <td>{item.Name}</td>
                          <td>{item.Description}</td>
                          <td>{item.NumRequired}</td>
                          <td>
                              <Link to={`/lessons?topicId=${item.key}`}>Chi tiết </Link>
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
          <div  iv class="modal-content dashboard-content-container">
            <form onSubmit={handleSubmit}>
                <input type='number' name='TopicSTT' placeholder='Số thứ tự ' value={topics.TopicSTT} onChange={handleDataChange} required />
                <input type='text' name='Name' placeholder='Tên Level' value={topics.Name} onChange={handleDataChange} required  />
                <input type='text' name='Description' placeholder='Mô tả Level' value={topics.Description} onChange={handleDataChange} required />   
                <input type='text' name='NumRequired' placeholder='Số Topic trong Level' value={topics.NumRequired} onChange={handleDataChange} required />
                
                <button type='submit'>Submit</button>
            </form>
                <button onClick={handleCloseModal} className="btn btn-secondary">Close</button>
            </div>
        </div>
      )}

      {topicsData !== null ?
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
)
}

export default Topics