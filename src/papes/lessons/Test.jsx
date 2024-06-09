import React, {useState, useEffect} from 'react';
import DashboardHeader from '../../components/DashboardHeader';

import {calculateRange, sliceData} from '../../untils/table-pagination';
import { IconContext } from "react-icons";
import { AiFillLeftCircle, AiFillRightCircle } from "react-icons/ai";

import './styles.css';
import DoneIcon from '../../assets/icons/done.svg';
import CancelIcon from '../../assets/icons/cancel.svg';
import RefundedIcon from '../../assets/icons/refunded.svg';
import { deleteDataToRealTimeDB, editDataToRealTimeDB, readDataToRealTimeDB, writeDataToRealTimeDB } from '../../untils/DataHelper';
import { Link } from 'react-router-dom';
import ReactPaginate from 'react-paginate';

function Orders () {
    const [currentPage, setcurrentPage] = useState(1);
    const [levels, setLevels] = useState({
        LevelSTT : 0, Name: '', Description: '', NumRequired: 0
      });
      const [levelsData, setLevelsData] = useState(null);
      const [editingLevel, setEditingLevel] = useState(null); 
      const [showModal, setShowModal] = useState(false);
      const [totalPages, setTotalPages] = useState(0);
      const [currentPageData, setCurrentPageData] = useState([]);
      const itemsPerPage = 10; 
    
    useEffect(() => {
        readDataToRealTimeDB('Levels', setLevelsData);
    }, []);
    useEffect(() => {
      if (levelsData) {
          const dataKeys = Object.keys(levelsData); // Lấy ra danh sách các khóa từ levelsData
          const TotalPages = Math.ceil(dataKeys.length / itemsPerPage);
          setTotalPages(TotalPages);
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const currentPageDataWithKeys = dataKeys.slice(startIndex, endIndex).map(key => ({
              key: key,
              ...levelsData[key]
          }));
          setCurrentPageData(currentPageDataWithKeys);
      }
  }, [levelsData, currentPage]);
    console.log(totalPages)
    const handlePageClick = (event) => {
        setcurrentPage(event.selected + 1);
    }
      
      const handleDataChange = (e) =>{
        const { name, value } = e.target;
        setLevels(prevState => ({...prevState, [name]: value}));
      }
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        const newDataKey = await writeDataToRealTimeDB('Levels', levels);
        console.log('New data key: ', newDataKey);
        setLevels({ LevelSTT : 0, Name: '', Description: '', NumRequired: 0 }); // Đặt lại giá trị trống cho trường input
      }
    
      const handleEdit = async (idLevel) => {
        const levelToUpdate = levelsData[idLevel];
        setLevels(levelToUpdate);
        setEditingLevel(idLevel);
        setShowModal(true);
      }
    
      const handleSaveEdit = async () => {
        await editDataToRealTimeDB(`Levels/${editingLevel}`, levels);
        setEditingLevel(null); 
        setLevels({ LevelSTT : 0, Name: '', Description: '', NumRequired: 0 }); 
        setShowModal(false); 
      };
      
      const handleDelete = async (idLevel) => {
        try{
          await deleteDataToRealTimeDB(`Levels/${idLevel}`);
          console.log("Levels deleted successfully!");
        } catch(error) {
          console.error("Error deleting levels:", error);
        }
      }

      const handleCloseModal = () => {
        setLevels({ LevelSTT: 0, Name: '', Description: '', NumRequired: 0 });
        setShowModal(false);
    } 
    

    return(
        <div className='dashboard-content'>
            <DashboardHeader
                btnText="New Order" />

            <div className='dashboard-content-container'>
                <div className='dashboard-content-header'>
                    <h2>Orders List</h2>
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
                        <th>ID</th>
                        <th>DATE</th>
                        <th>STATUS</th>
                        <th>COSTUMER</th>
                        <th>PRODUCT</th>
                        </tr>
                    </thead>

                    {currentPageData.length > 0 ?
                        <tbody>
                            {currentPageData.map((item, index) => (
                                <tr key={index} className='hovers'>
                                    <td>{item.LevelSTT}</td>
                                    <td>{item.Name}</td>
                                    <td>{item.Description}</td>
                                    <td>{item.NumRequired}</td>
                                    <td>
                                        <Link to={`/topics?levelId=${item.key}`}>Chi tiết </Link>
                                        <button onClick={() => handleEdit(item.id)}> Edit</button>
                                        <button onClick={() => handleDelete(item.id)}> Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    : null}
                </table>

                {levelsData !== null ?
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

export default Orders;

