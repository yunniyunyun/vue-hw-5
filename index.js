import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
      VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
  });

// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'winter_';

const productModal = {
    props: ['id', 'addToCart', 'openModal'],
    data(){
        return {
            modal: {},
            tempProduct: {},
            qty: 1,
        };
    },
    template: '#userProductModal',
    watch:{
        id(){
            if (this.id){
                axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`)
                .then(res =>{
                    this.tempProduct = res.data.product;
                    this.modal.show()
                });
            }
        }
    },
    methods:{
        hide() {
            this.modal.hide();
        }
    },
    mounted(){
        this.modal = new bootstrap.Modal(this.$refs.modal);
        this.$refs.modal.addEventListener('hidden.bs.modal', (event) =>{
            this.openModal('');
        });
    }
}

const app = Vue.createApp({
    data() {
        return {
            products: [],
            productId: '',
            cart: {},
            loadingItem: '',
            order: {
                user: {
                    name: '',
                    email: '',
                    tel: '',
                    address: '',
                },
                message:''
            },
            state: {
                loadingItem: '',
                order: false
            }
        }
    },
    methods:{
        getProducts(){
            axios.get(`${apiUrl}/api/${apiPath}/products/all`)
            .then(res =>{
                this.products = res.data.products;
            });
        },
        openModal(id){
            this.productId = id ;
            this.state.loadingItem = id;
        },
        addToCart(product_id, qty = 1){
            const data = {
                product_id,
                qty,
            };
            this.state.loadingItem = product_id;
            axios.post(`${apiUrl}/api/${apiPath}/cart`, { data })
            .then((res) =>{
                this.$refs.productModal.hide();
                this.getCarts();
                this.state.loadingItem = '';
            });
        },
        getCarts(){
            axios.get(`${apiUrl}/api/${apiPath}/cart`)
            .then(res =>{
                this.cart = res.data.data;
            });
        },
        updateCart(item){
            const data = {
                product_id: item.product.id,
                qty: item.qty,
            };
            this.loadingItem = item.id;
            axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, { data })
            .then(res =>{
                this.getCarts();
                this.loadingItem = '';
            });
        },
        deleteCart(item){
            this.loadingItem = item.id;
            axios.delete(`${apiUrl}/api/${apiPath}/cart/${item.id}`)
            .then(res =>{
                this.getCarts();
                this.loadingItem = '';
            });
        },
        // 表單
        createOrder() {
            this.state.order = true;
            axios.post(`${apiUrl}/api/${apiPath}/order`, {data: this.order})
            .then(res =>{
                // FIXME
                this.$refs.form.resetForm();
                this.order = {
                    user: {
                        name: '',
                        email: '',
                        tel: '',
                        address: '',
                    },
                    message:''
                }
                this.state.order = false;
                this.getCart();
                console.log(res)
                // alert(res.message);
            })
            .catch(err => {
                alert(err.data?.message);
                this.state.order = false;
            });
        },
        isPhone(value) {
            const phoneNumber = /^(09)[0-9]{8}$/
            return phoneNumber.test(value) ? true : '需要正確的電話號碼'
        }
    },
    components:{
        productModal,
    },
    mounted(){
        this.getProducts();
        this.getCarts();
    }
});

app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('#app');