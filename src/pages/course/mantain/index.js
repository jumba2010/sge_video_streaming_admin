import React from 'react';
import {
  Table,
  Card,
  Alert,
  Modal,
  Divider,
  Tabs,
  Button,
  Form,
  Input,
  Typography,
} from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { notification } from 'antd';
import api, { baseURL } from '../../../services/api';
import { USER_KEY, SUCURSAL } from '../../../services/auth';
import moment from 'moment';
import axios from 'axios';
const { TextArea } = Input;
const { Text } = Typography;
const { TabPane } = Tabs;
const frequencies = JSON.parse(localStorage.getItem('FREQUENCIES'));
import styles from './index.less';
const FormItem = Form.Item;

const pageSize = 6;

const layout={
  labelCol:{span:5},
  wrapperCol:{span:16}
  
      }

class ListStudent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      studentIds: [],
      originaldata: [],
      sync: false,
      lastdata: [],
      courseName:'',
      students: [],
      notifications: [],
      lastNotificationdata: [],
      payments: [],
      selectedRowKeys: [],
      data: [],
      all: false,
      id:'',
      visible: false,
      saving: false,
      frequencies: [],
      message: '',
      pagination: {},
      pagination1: {},
      expandForm: false,
      loadign: true,
    };

    this.handleChangeInput = this.handleChangeInput.bind(this);

  }


  editStudent(record) {
    let normalizedName=record.name.split(" ").join("").toLowerCase()
    this.props.history.push('/admin/course/edit/' + normalizedName);
  }

  handleAnull(record) {
    this.setState({courseName:record.name,visible:true,id:record._id})
  }

  handleChangeInput(evt) {
    if (evt.target.name === 'name') {
      let s = this.state.lastdata.filter(
        d => d.name.toLowerCase().indexOf(evt.target.value.toLowerCase()) > -1,
      );
      this.setState({ data: s });
    }

    if (evt.target.name === 'message') {
      this.setState({ message: evt.target.value });
    }
  }

  confirmCourseDeletion = ()=>{
     api
    .put('/api/course/inactive/'+this.state.id, {
    }).then((data)=>{

      let newData=this.state.data.filter(d=>d._id!==this.state.id);
      this.setState({ visible: false ,data:newData});
      notification.success({
        description: 'Aula adicionada com sucesso',
        message: 'Aula adicionada com sucesso',
      });
    })
    .catch(function(error) {
  
      notification.error({
        description: error.message,
        message: 'Erro ao processar o pedido',
      });
    });

   
  }

  
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  notify = () => {
    this.setState({
      visible: true,
      all: false,
    });
  };


  handleCancel() {
    this.setState({
      visible: false,
    });
  }

 
  handleChangeTable = (paginatio, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = paginatio.current;
    this.setState({ paginatio: pager });
  };

  handleChangeTable2 = (paginatio1, filters, sorter) => {
    const pager = { ...this.state.pagination1 };
    pager.current = paginatio1.current;
    this.setState({ paginatio1: pager });
  };

  componentDidMount() {
    this.searchFields();
  }

  searchFields() {
    api
      .get('/api/course' )
      .then(res => {
        const pagination = { ...this.state.pagination };
        pagination.total = res.data.length;
        pagination.pageSize = pageSize;
        this.setState({
          originaldata: res.data,
          data: res.data,
          loadign: false,
          pagination,
        })
      }).catch((error)=>{

        console.log(error)
        this.setState({
          loadign: false,
        })
          
      });;
  }

  render() {

    const columns = [
      { title: 'Designação', dataIndex: 'name', key: 'name', render: text => <a onClick={()=>{let normalizedName=text.split(" ").join("").toLowerCase()
      this.props.history.push('/admin/course/edit/' + normalizedName);}}>{text}</a> },
      { title: 'Link da Aula', dataIndex: 'link', key: 'link' },
    
      {
        title: '',
        key: 'operation',
        render: (text, record) => (
          <span>
            <a onClick={this.editStudent.bind(this, record)}>Editar</a>
            <Divider type="vertical"></Divider>
            <a onClick={this.handleAnull.bind(this, record)}>Remover</a>
          </span>
        ),
      },
    ];

    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };


    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
         
              <div className={styles.tableList}>
               
                <div className={styles.tableListOperator}>
                  <Button
                    icon="plus"
                    type="primary"
                    onClick={() => this.props.history.push('/admin/course/create')}
                  >
                   Adicionar Aula
                  </Button>
                </div>
                <Table
                  className="components-table-demo-nested"
                  columns={columns}
                  onSelectChange={this.onSelectChange}
                  columnTitle="Seleccionar Todos"
                  rowSelection={rowSelection}
                  rowKey={record => record.studentNumber}
                  loading={this.state.loadign}
                  onSelectAll={this.onSelectAll}
               
                  pagination={this.state.pagination}
                  dataSource={this.state.data}
                  onChange={this.handleChangeTable}
                />
              </div>
         
        </Card>
        <Modal
visible={this.state.visible}
title={  <Alert message='Tem a certeza que deseja remover esta aula?' description="Esta acção é irreversível." type="error" showIcon />}
        footer={[
            <Button key="back" onClick={()=>{this.setState({visible:false})}}>
             Cancelar
            </Button>,
            <Button key="submit" type="danger" disabled={!this.state.name || this.state.courseName.toLowerCase()!=this.state.name.toLowerCase()}  onClick={this.confirmCourseDeletion}>
              Remover
            </Button>,
          ]}
          closable={false}
          onCancel={()=>{this.setState({visible:false})}}
        >
       <Form {...layout} > 
       <Text type="secondary" >Confirm by typing the course name below</Text>
        <FormItem
                 
                 label='Name'
                >
                 
                  <Input
              name="name"
              autoComplete='off'
              onChange={(ev)=> this.setState({name:ev.target.value})}
                    placeholder={this.state.courseName}
                  /> 
                </FormItem></Form>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}
export default Form.create({})(ListStudent);
