import React from 'react';
import {
  Steps,
  Card,
  Button,
  message,
  Icon,
  Form,
  Input,
  Select,
  Descriptions,
  Row,
  Tooltip,
  Alert,
  Result,
} from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { notification } from 'antd';
import api from './../../../services/api';
const { Step } = Steps;
const { TextArea } = Input;

import styles from './index.less';


function URLReplacer(str){
  let match = str.match(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig);
  let final=match.map(url=>url
  )
  return final;
}
const steps = [
  {
    title: 'Course Details',
    content: <div></div>,
  },
 
  {
    title: 'Confirm',
    content: '2',
  },
  {
    title: 'Sucess',
    content: '3',
  },
];

class Student extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      current: 0,
      id:'',
      loading: false,
      name: '',
      url: '',
      link:'',
    };
   this.handleChangeInput=this.handleChangeInput.bind(this);
  }

  validateName(rule,value){
let parameter=this.props.match.params.coursename;
return new Promise(async (resolve,reject)=>{
let normalizedName=value.split(" ").join("").toLowerCase()
let data= await api.get("/api/course/"+normalizedName);

if(data.data.length!=0 && normalizedName!=parameter){
  await reject('The name must be unique');
}
else{
  await resolve()
}
    })
  }
  handleChangeInput(evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }

  componentDidMount() {
   let param=this.props.match.params.coursename;
  
   api.get("/api/course/"+param).then((response)=>{
    let data=response.data[0];
    this.setState({name:data.name,url:data.url,link:data.link,id:data._id})
   });
   
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Values:', values);
      }
    });
  };

  confirmTransaction = async () => {
    window.scrollTo(0, 0);
    this.setState({ issaving: true });

    const {name,url,link,id} = this.state;

     api
      .put('/api/course/'+id, {
        name:name,
        link:link,
        url:url,
        urls:URLReplacer(url),
        createdBy: 1
     
      }).then((response)=>{
       const current = this.state.current + 1;
        this.setState({ current, issaving: false });
      })
      .catch(function(error) {
    
        notification.error({
          description: error.message,
          message: 'Error processing the request',
        });
      });


  };

  next1() {
    this.props.form.validateFieldsAndScroll((err, values) => {});
    
    if (this.state.name && this.state.url && this.state.link) {
      const current = this.state.current + 1;
      this.setState({ current });
    }
  }

  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  restart() {
    const { form, dispatch } = this.props;
    form.resetFields();
  
    this.setState({
      current: 0,
      loading: false,
      name: '',
      url: '',
      link:'',
     
    });

    this.props.history.push('/Welcome')
  }

  render() {
    const { current } = this.state;
    const { getFieldDecorator } = this.props.form;
  
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };

    const extra = (
      <>
        <Button type="primary" onClick={this.restart.bind(this)}>
          Create New Course
        </Button>
        <Button onClick={() => this.props.history.push('/Welcome')}>
          List all Courses
        </Button>
      </>
    );

    return (
      <PageHeaderWrapper>
        <Card>
          <Steps current={current} size="default">
            {steps.map(item => (
              <Step
                key={item.title}
                title={item.title}
                icon={
                  item.title === 'Confirm' && current == 4 && this.state.issaving ? (
                    <Icon type="loading" />
                  ) : null
                }
              />
            ))}
          </Steps>
          <div className="steps-content">
            {current == 0 ? (
              <Row
                style={
                  localStorage.getItem('LAST_STUDENT') != null
                    ? { padding: '0px 0px' }
                    : { padding: '50px 20px' }
                }
              >
  
                  <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                    <Form.Item
                      label={
                        <span>
                          Course name&nbsp;
                          <Tooltip title="Course Name">
                            <Icon type="question-circle-o" />
                          </Tooltip>
                        </span>
                      }
                    >
                      {getFieldDecorator('name', {
                        initialValue: `${this.state.name}`,
                        rules: [
                          {
                            required: true,
                            message: 'Please provide the course name!',
                            whitespace: true,
                          },
                      {

                        validator:this.validateName
                      }
                        ],
                      })(
                        <Input name="name" autoComplete="off" onChange={this.handleChangeInput} />,
                      )}
                    </Form.Item>
                  
                    <Form.Item label="Course Link ">
                      {getFieldDecorator('link', {
                        initialValue: `${this.state.link}`,
                        rules: [
                          {
                            required: true,
                            message: '',
                          },
                        ],
                      })(
                        <Input
                          style={{ width: '100%' }}
                          autoComplete="off"
                          placeholder=""
                          name="link"
                          onChange={this.handleChangeInput}
                        />)}
                    </Form.Item>
                    <Form.Item label={<span>Content URL</span>}>
                      {getFieldDecorator('url', {
                        initialValue: `${this.state.url}`,
                        rules: [
                          {
                            required: true,
                            message: 'Please provide the Content URL!',
                            whitespace: true,
                          },
                        ],
                      })(
                        <TextArea
                          rows={4}
                          name="url"
                          onChange={this.handleChangeInput}
                        />,
                      )}
                    </Form.Item>
                  

                    <Form.Item>
                      <Button
                        type="danger"
                        style={{ marginLeft: 180 }}
                        onClick={() => this.restart()}
                      >
                        Cancel
                      </Button>
                      <Button
                        style={{ marginLeft: 8 }}
                        type="primary"
                        htmlType="submit"
                        onClick={() => this.next1()}
                      >
                        Next
                      </Button>
                    </Form.Item>
                  </Form>
                
              </Row>
            ) : null}
        

            {current == 1 ? (
              <Form {...formItemLayout} style={{ padding: '50px 0' }}>
                <Alert
                  message="Please confirm the fields below and then click on Confirm"
                  type="info"
                  showIcon
                />

                <Descriptions
                  title="Course details"
                  style={{ marginBottom: 10, marginTop: 32 }}
                  column={1}
                  className={styles.information}
                >
                  <Descriptions.Item label="Course Name">{this.state.name}</Descriptions.Item>
                 
                  <Descriptions.Item label="Course Link">
                    {this.state.link}
                  </Descriptions.Item>

                  <Descriptions.Item label="Content URL">
                    {this.state.url}
                  </Descriptions.Item>
                </Descriptions>
             
                <Form.Item>
                  <Button style={{ marginLeft: 180 }} onClick={() => this.prev()}>
                    Previous
                  </Button>

                  <Button
                    style={{ marginLeft: 8 }}
                    loading={this.state.issaving}
                    type="primary"
                    htmlType="submit"
                    onClick={() => this.confirmTransaction()}
                  >
                    Confirm
                  </Button>
                </Form.Item>
              </Form>
            ) : null}
            {current == 2 ? (
              <Form {...formItemLayout} style={{ padding: '50px 0' }}>
                <Result
                  status="success"
                  title="Course created Sucessfully!"
                  subTitle="Course created Sucessfully!"
                  extra={extra}
                />
                <Form.Item></Form.Item>
              </Form>
            ) : null}
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
export default Form.create({})(Student);
