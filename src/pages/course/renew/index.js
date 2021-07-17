import React from 'react';
import ReactDOM from 'react-dom';
var querystring = require('querystring');
import {
  Table,
  Card,
  Row,
  Col,
  Badge,
  DatePicker,
  Descriptions,
  Modal,
  Popconfirm,
  Divider,
  Statistic,
  Dropdown,
  Tabs,
  Icon,
  Button,
  Form,
  Input,
  Checkbox,
  Select,
  InputNumber,
  message,
  Alert,
  Typography,
  Result,
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

const returnYearToRencer = () => {
  var years = [];
  let year1 = new Date().getFullYear();
  let year2 = year1 + 1;
  let year3 = year1 - 1;
  years = [year3, year1, year2];

  return years;
};

const formItemLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 14 },
};

function CurrencyFormatted(amount) {
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

class RenewStudent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      studentIds: [],
      originaldata: [],
      sync: false,
      success: false,
      frequency: 0,
      lastdata: [],
      students: [],
      notifications: [],
      monthlyPayment: 0,
      lastNotificationdata: [],
      payments: [],
      oldMonthlyValue: 0,
      selectedRowKeys: [],
      data: [],
      all: false,
      visible: false,
      discount: 0.0,
      saving: false,
      frequencies: [],
      total: 0,
      payFirstMonth: true,
      message: '',
      pagination: {},
      year: new Date().getFullYear(),
      pagination1: {},
      expandForm: false,
      loadign: true,
    };

    this.handleChangeInput = this.handleChangeInput.bind(this);
    this.handleSelectClass = this.handleSelectClass.bind(this);
    this.handleSelectLevel = this.handleSelectLevel.bind(this);
  }

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.searchFields();
  };

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

  onSelectChange = selectedRowKeys => {
    let student = this.state.data.filter(s => s.studentNumber == selectedRowKeys[0])[0];
    if (student.level == 7) {
      return;
    }
    let freq = frequencies.filter(f => f.level === student.level + 1)[0];

    this.setState({
      selectedRowKeys,
      recurigRegistrationValue: freq.recurigRegistrationValue,
      monthlyPayment: freq.monthlyPayment,
      frequency: freq.id,
      discount: 0,
      total: this.state.payFirstMonth
        ? freq.monthlyPayment + freq.recurigRegistrationValue
        : freq.recurigRegistrationValue,
      oldMonthlyValue: freq.monthlyPayment,
    });
  };

  onSelectAll = allSelected => {
    if (this.state.selectedRowKeys.length && allSelected) {
      this.setState({
        selectedRowKeys: allSelected,
      });
    }
  };

  handleSelectClass(frequency) {
    let s = this.state.students.filter(d => d.level === frequency);
    this.setState({ data: s, lastdata: s });
  }

  changePayFirstMonth(e) {
    let total = e.target.checked
      ? this.state.recurigRegistrationValue + this.state.monthlyPayment
      : this.state.recurigRegistrationValue;
    this.setState({ payFirstMonth: e.target.checked, total });
  }

  handleSelectLevel(frequency) {
    let freq = frequencies.filter(f => f.level === frequency)[0];
    let total = freq.recurigRegistrationValue + freq.monthlyPayment;
    this.setState({
      frequency,
      recurigRegistrationValue: freq.recurigRegistrationValue,
      monthlyPayment: freq.monthlyPayment,
      oldMonthlyValue: freq.monthlyPayment,
      total,
    });
  }

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

  handleOk = async () => {
    this.setState({
      saving: true,
    });

    let loggedUser = JSON.parse(localStorage.getItem(USER_KEY));
    let sucursal = JSON.parse(localStorage.getItem(SUCURSAL));

    const {
      year,
      payFirstMonth,
      total,
      monthlyPayment,
      discount,
      selectedRowKeys,
      frequency,
    } = this.state;
    let studentId = this.state.students.filter(s => s.studentNumber == selectedRowKeys[0])[0].id;
    let level = frequencies.filter(f => f.id == frequency)[0].level;

    await api
      .post('/api/registration/renew', {
        year,
        totalPaid: total,
        monthlyPayment,
        discount,
        needSpecialTime: false,
        studentId,
        sucursal,
        level,
        classId: frequency,
        createdBy: loggedUser.id,
        payFirstMonth,
        activatedBy: loggedUser.id,
      })
      .catch(function(error) {
        notification.error({
          description: 'Erro ao Processar o o seu pedido',
          message: 'Erro ao processar o pedido',
        });
      });

    this.searchFields();
    this.setState({
      saving: false,
      success: true,
    });
  };

  handleCancel() {
    this.setState({
      visible: false,
    });
  }

  restartTransaction() {
    this.setState({
      visible: false,
      success: false,
    });
  }

  handleSelectDiscount(discount) {
    let monthlyPayment = this.state.oldMonthlyValue * (1 - parseFloat(discount));
    let total = this.state.recurigRegistrationValue + monthlyPayment;
    this.setState({ discount, monthlyPayment, total });
  }

  handleSelectYear(year) {
    this.setState({ year });
  }

  handleSearch = () => {
    e.preventDefault();
  };

  renderSimpleForm() {
    const { form } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="Nome">
              {getFieldDecorator('name', {
                initialValue: '',
                rules: [
                  {
                    required: false,
                    message: 'Por favor informe o nome do Encarregado!',
                    whitespace: true,
                  },
                ],
              })(
                <Input
                  placeholder="Nome.."
                  autoComplete="off"
                  name="name"
                  onChange={this.handleChangeInput}
                />,
              )}
            </FormItem>
          </Col>

          <Col md={7} sm={24}>
            <FormItem label="Nível anterior">
              {getFieldDecorator('level', { initialValue: '', rules: [{ required: false }] })(
                <Select
                  onChange={this.handleSelectClass}
                  placeholder="Pesqise pelo Nível ..."
                  style={{ width: '100%' }}
                >
                  {frequencies
                    ? frequencies.map(f => (
                        <Select.Option value={f.level}>{f.description}</Select.Option>
                      ))
                    : null}
                </Select>,
              )}
            </FormItem>
          </Col>

          <Col md={9} sm={24}>
            <span>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset.bind(this)}>
                Limpar Campos
              </Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                Mostrar Mais <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const { form } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="Nome">
              {getFieldDecorator('name', { initialValue: '', rules: [{ required: false }] })(
                <Input
                  name="name"
                  autoComplete="off"
                  onChange={this.handleChangeInput}
                  placeholder="Pesquise pelo nome ..."
                />,
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="Nível anterior">
              {getFieldDecorator('level', { initialValue: '', rules: [{ required: false }] })(
                <Select
                  onChange={this.handleSelectClass}
                  placeholder="Pesquise pelo Nível ..."
                  style={{ width: '100%' }}
                >
                  {JSON.parse(frequencies).map(f => (
                    <Select.Option value={f.level}>{f.description}</Select.Option>
                  ))}
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="Idade">
              <InputNumber style={{ width: '100%' }} />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="Data de Inscrição">
              {getFieldDecorator('createdAt', {
                initialValue: '',
                rules: [{ type: 'object', required: false }],
              })(
                <DatePicker
                  name="createdAt"
                  style={{ width: '100%' }}
                  placeholder="Data de Inscrição"
                />,
              )}
            </FormItem>
          </Col>

          <Col md={8} sm={24}>
            <FormItem label="Estado">
              {getFieldDecorator('createdAt', { initialValue: '', rules: [{ required: false }] })(
                <Select placeholder="Estado.." style={{ width: '100%' }}>
                  <Select.Option value="0">Activo</Select.Option>
                  <Select.Option value="1">Inactivo</Select.Option>
                  <Select.Option value="2">Novo Ingresso</Select.Option>
                </Select>,
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'right', marginBottom: 24 }}>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              Limpar Campos
            </Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              Mostrar Menos <Icon type="up" />
            </a>
          </div>
        </div>
      </Form>
    );
  }

  renderForm() {
    const { expandForm } = this.state;
    return expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
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

    this.setState({ sync: true });
  }

  searchFields() {
    api
      .get('/api/student/unrenewd/sucursal/' + JSON.parse(localStorage.getItem(SUCURSAL)).id)
      .then(res => {
        const pagination = { ...this.state.pagination };
        pagination.total = res.data.length;
        pagination.pageSize = pageSize;

        let studentIds = res.data.map(s => s.studentNumber);
        this.setState({
          studentIds,
          originaldata: res.data,
          data: res.data,
          students: res.data,
          lastdata: res.data,
          loadign: false,
          pagination,
        });
      });
  }

  render() {
    const columns = [
      { title: 'Nome', dataIndex: 'name', key: 'name', render: text => <a>{text}</a> },
      { title: 'Data de Nacimento', dataIndex: 'birthDate', key: 'birthDate' },
      {
        title: 'Nível Anterior',
        dataIndex: 'level',
        key: 'level',
        render: (_, record) => (
          <Text>{frequencies.filter(frq => frq.level === record.level)[0].description}</Text>
        ),
      },
      {
        title: 'Data de Inscrição',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (_, record) => <Text>{moment(record.createdAt).format('YYYY-MM-DD')}</Text>,
      },
      ,
    ];

    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      type: 'radio',
      onChange: this.onSelectChange,
    };

    const hasSelected = this.state.selectedRowKeys.length > 0;
    const { getFieldDecorator } = this.props.form;
    const selectedStudent = this.state.data.filter(s => s.studentNumber == selectedRowKeys[0])[0];
    const freq = frequencies.filter(
      f => f.level == (selectedStudent ? selectedStudent.level + 1 : 1),
    )[0];
    const frequency = freq.description;

    const extra = (
      <>
        <Button type="primary" onClick={this.restartTransaction.bind(this)}>
          Nova Transacao
        </Button>
        <Button onClick={() => this.props.history.push('/student/mantain')}>
          Listar Estudante
        </Button>
      </>
    );

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Lista de Estudantes" key="1" style={{ marginButton: 20 }}>
              <div className={styles.tableList}>
                <div className={styles.tableListForm}>{this.renderForm()}</div>
                <div className={styles.tableListOperator}>
                  <Button type="primary" onClick={this.notify} disabled={!hasSelected}>
                    Renovar Inscrição
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
                  expandedRowRender={record => (
                    <div style={{ marginBottom: 10, marginTop: 32 }}>
                      <Descriptions
                        title="Dados Pessoais"
                        column={2}
                        className={styles.information}
                      >
                        <Descriptions.Item label="Nome Completo">{record.name}</Descriptions.Item>
                        <Descriptions.Item label="Data de Nascimento">
                          {record.birthDate}
                        </Descriptions.Item>
                        <Descriptions.Item label="Sexo">{record.sex}</Descriptions.Item>
                        <Descriptions.Item label="Alérgico aos medicamentos">
                          {record.alergicToMedicine}
                        </Descriptions.Item>
                        <Descriptions.Item label="Alérgico a comida">
                          {record.alergicToFood}
                        </Descriptions.Item>
                        <Descriptions.Item label="Morada">{record.address}</Descriptions.Item>
                        <Descriptions.Item label="Tipo de Documento">
                          {record.docType}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nr. de Documento">
                          {record.docNumber}
                        </Descriptions.Item>
                      </Descriptions>
                      <Divider style={{ marginBottom: 10 }} column={2} />
                      <Descriptions
                        title="Filiação"
                        style={{ marginBottom: 10 }}
                        className={styles.information}
                      >
                        <Descriptions.Item label="Nome do Pai">
                          {record.fatherName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Contacto do Pai">
                          {record.fatherContact}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nome da Mãe">
                          {record.motherName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Contacto da Mãe">
                          {record.motherContact}
                        </Descriptions.Item>
                      </Descriptions>
                      <Divider style={{ marginBottom: 10 }} />
                      <Descriptions
                        title="Dados do Encarregado"
                        style={{ marginBottom: 10 }}
                        column={2}
                        className={styles.information}
                      >
                        <Descriptions.Item label="Grau de Parentesco">
                          {record.carier.kinshipDegree}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nome">{record.carier.name}</Descriptions.Item>
                        <Descriptions.Item label="Contacto">
                          {record.carier.contact}
                        </Descriptions.Item>
                        <Descriptions.Item label="Local de Trabalho">
                          {record.carier.workPlace}
                        </Descriptions.Item>
                      </Descriptions>
                      <Divider style={{ marginBottom: 10 }} />
                      <Descriptions
                        title="Dados de Inscrição"
                        style={{ marginBottom: 10 }}
                        column={2}
                        className={styles.information}
                      >
                        <Descriptions.Item label="Frequência">
                          {frequencies.filter(frq => frq.level === record.level)[0].description}
                        </Descriptions.Item>
                        <Descriptions.Item label="Valor Mensal">
                          <Statistic value={record.currentMonthlyPayment} suffix="MZN" />
                        </Descriptions.Item>
                      </Descriptions>{' '}
                    </div>
                  )}
                  pagination={this.state.pagination}
                  dataSource={this.state.data}
                  onChange={this.handleChangeTable}
                />
              </div>
            </TabPane>
          </Tabs>
        </Card>

        <Modal
          visible={this.state.visible}
          title="Renovação de inscrição"
          onOk={this.handleOk}
          width={800}
          onCancel={this.handleCancel.bind(this)}
          footer={[
            !this.state.success ? (
              <>
                <Button type="danger" key="back" onClick={this.handleCancel.bind(this)}>
                  Cancelar
                </Button>
                ,
                <Button
                  key="submit"
                  htmlType="submit"
                  type="primary"
                  onClick={this.handleOk.bind(this)}
                  loadign={this.state.saving}
                >
                  Confirmar
                </Button>
                ,
              </>
            ) : null,
          ]}
        >
          {!this.state.success ? (
            <div>
              <Row style={{ padding: '20px 10px' }}>
                <Descriptions title={selectedStudent ? selectedStudent.name : ''}>
                  <Descriptions.Item label="Nível anterior">
                    {selectedStudent
                      ? frequencies.filter(frq => frq.level === selectedStudent.level)[0]
                          .description
                      : ''}
                  </Descriptions.Item>
                  <Descriptions.Item label="Data da ultima Inscrição">
                    {moment(selectedStudent ? selectedStudent.createdAt : new Date()).format(
                      'YYYY-MM-DD',
                    )}
                  </Descriptions.Item>
                </Descriptions>
                <Divider style={{ marginBottom: 5 }} />
                <Form {...formItemLayout} style={{ padding: '5px 0' }}>
                  <Form.Item label="Nível">
                    {getFieldDecorator('frequency', {
                      initialValue: `${frequency}`,
                      rules: [{ required: true, message: 'Por favor informe o Nível!' }],
                    })(
                      <Select
                        showSearch
                        placeholder="Seleccione o Nível.."
                        optionFilterProp="children"
                        onChange={this.handleSelectLevel}
                        filterOption={(input, option) =>
                          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {frequencies.map(f => (
                          <Select.Option value={f.id}>{f.description}</Select.Option>
                        ))}
                      </Select>,
                    )}
                  </Form.Item>
                  <Form.Item label="Ano: ">
                    {getFieldDecorator('year', {
                      initialValue: `${new Date().getFullYear()}`,
                      rules: [{ required: true, message: 'Por favor informe o Ano!' }],
                    })(
                      <Select
                        showSearch
                        optionFilterProp="children"
                        onChange={this.handleSelectYear.bind(this)}
                        value={this.state.year}
                        filterOption={(input, option) =>
                          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {returnYearToRencer().map(y => (
                          <Select.Option value={y} key={y}>
                            {y}
                          </Select.Option>
                        ))}
                      </Select>,
                    )}
                  </Form.Item>
                  <Form.Item label="Desconto: ">
                    {getFieldDecorator('discount', {
                      rules: [{ required: false }],
                    })(
                      <Select
                        showSearch
                        placeholder="Seleccione o desconto.."
                        optionFilterProp="children"
                        onChange={this.handleSelectDiscount.bind(this)}
                        value={
                          this.state.discount ? this.state.discount : 'Seleccione desconto ...'
                        }
                        filterOption={(input, option) =>
                          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        <Select.Option value="0.0" key="1">
                          0%
                        </Select.Option>
                        <Select.Option value="0.05" key="2">
                          5%
                        </Select.Option>
                        <Select.Option value="0.10" key="3">
                          10%
                        </Select.Option>
                        <Select.Option value="0.15" key="4">
                          15%
                        </Select.Option>
                        <Select.Option value="0.20" key="5">
                          20%
                        </Select.Option>
                        <Select.Option value="0.25" key="6">
                          25%
                        </Select.Option>
                        <Select.Option value="0.30" key="7">
                          30%
                        </Select.Option>
                        <Select.Option value="0.35" key="8">
                          35%
                        </Select.Option>
                      </Select>,
                    )}
                  </Form.Item>
                  <Form.Item>
                    <Checkbox
                      name="payFirstMonth"
                      checked={this.state.payFirstMonth}
                      onChange={this.changePayFirstMonth.bind(this)}
                    >
                      Pagar a primeira mensalidade
                    </Checkbox>
                  </Form.Item>
                </Form>
              </Row>
            </div>
          ) : (
            <Form {...formItemLayout} style={{ padding: '50px 0' }}>
              <Result
                status="success"
                title="Operação Realizada com Sucesso!"
                subTitle={`Inscrição realizado com Sucesso `}
                extra={extra}
              />
              <Form.Item></Form.Item>
            </Form>
          )}

          <Row>
            <Col span={12}></Col>
            <Col span={12}>
              <Row style={{ 'margin-left': '5px', width: '100%' }}>
                <Row style={{ 'margin-top': '0px' }}>
                  Valor da renovação:{' '}
                  {CurrencyFormatted(parseFloat(this.state.recurigRegistrationValue))} MZN
                </Row>
              </Row>

              <Row style={{ 'margin-left': '10px', width: '100%' }}>
                <Row style={{ 'margin-top': '5px' }}>
                  Valor Mensal: {CurrencyFormatted(parseFloat(this.state.monthlyPayment))} MZN
                </Row>
              </Row>

              <Row style={{ 'margin-left': '10px', width: '100%' }}>
                <Row style={{ 'margin-top': '5px' }}>
                  <h2>Total a Pagar: {CurrencyFormatted(parseFloat(this.state.total))} MZN</h2>
                </Row>
              </Row>
            </Col>
          </Row>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}
export default Form.create({})(RenewStudent);
