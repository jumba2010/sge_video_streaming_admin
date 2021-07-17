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
import api,{baseURL} from './../../../services/api';
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
    title: 'Detalhes da Aula',
    content: <div></div>,
  },
 
  {
    title: 'Confirmação',
    content: '2',
  },
  {
    title: 'Sucesso',
    content: '3',
  },
];

class Student extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      current: 0,
      loading: false,
      name: '',
      url: '',
      link:'',
    };
   this.handleChangeInput=this.handleChangeInput.bind(this);
  }

  validateName(rule,value){
return new Promise(async (resolve,reject)=>{
let normalizedName=value.split(" ").join("").toLowerCase()
let data= await api.get("/api/course/"+normalizedName);
if(data.data.length!=0){
  await reject('Já existe outra aula com a mesma Designação');
}
else{
  await resolve()
}
    })
  }
  handleChangeInput(evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  
    if(evt.target.name=='name'){
      this.setState({ link:baseURL+'/'+evt.target.value}); 
    }
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

    const {name,url,link} = this.state;
     api
      .post('/api/course', {
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
          message: 'Erro ao processar seu pedido',
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
          Adicionar outra Aula
        </Button>
        <Button onClick={() => this.props.history.push('/Welcome')}>
          Lista de Aulas
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
                          Designação da Aula
                         
                        </span>
                      }
                    >
                      {getFieldDecorator('name', {
                        initialValue: `${this.state.name}`,
                        rules: [
                          {
                            required: true,
                            message: 'A Designação da Aula é obrigatória',
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
                  
                    <Form.Item label="Link da Aula">
                      {getFieldDecorator('link', {
                        initialValue: `${this.state.link}`,
                        rules: [
                          {
                            required: true,
                            message: 'O Link da Aula é obrigatório',
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
                    <Form.Item label={<span>URL do Conteúdo</span>}>
                      {getFieldDecorator('url', {
                        initialValue: `${this.state.url}`,
                        rules: [
                          {
                            required: true,
                            message: 'O link do conteúdo é obrigatório!',
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
                        Cancelar
                      </Button>
                      <Button
                        style={{ marginLeft: 8 }}
                        type="primary"
                        htmlType="submit"
                        onClick={() => this.next1()}
                      >
                        Próximo
                      </Button>
                    </Form.Item>
                  </Form>
                
              </Row>
            ) : null}
        

            {current == 1 ? (
              <Form {...formItemLayout} style={{ padding: '50px 0' }}>
                <Alert
                  message="Confirme os Dados abaixo e clique em Confirmar"
                  type="info"
                  showIcon
                />

                <Descriptions
                  title="Detalhes da Aula"
                  style={{ marginBottom: 10, marginTop: 32 }}
                  column={1}
                  className={styles.information}
                >
                  <Descriptions.Item label="Designação da Aula">{this.state.name}</Descriptions.Item>
                 
                  <Descriptions.Item label="Link da Aula">
                    {this.state.link}
                  </Descriptions.Item>

                  <Descriptions.Item label="URL do Conteúdo">
                    {this.state.url}
                  </Descriptions.Item>
                </Descriptions>
             
                <Form.Item>
                  <Button style={{ marginLeft: 180 }} onClick={() => this.prev()}>
                    Anterior
                  </Button>

                  <Button
                    style={{ marginLeft: 8 }}
                    loading={this.state.issaving}
                    type="primary"
                    htmlType="submit"
                    onClick={() => this.confirmTransaction()}
                  >
                    Confirmar
                  </Button>
                </Form.Item>
              </Form>
            ) : null}
            {current == 2 ? (
              <Form {...formItemLayout} style={{ padding: '50px 0' }}>
                <Result
                  status="success"
                  title="Aula Cadastrada com sucesso!"
                  subTitle="Aula Cadastrada com sucesso!"
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
