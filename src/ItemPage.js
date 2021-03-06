import React from 'react'
import withRouter from './utils/withRouter'
import { connect } from 'react-redux'
import { PRODUCT } from './queries/product'
import { client } from '.'
import { generateAttributes } from './utils/generateAttributes'
import { addToCartFunc } from './utils/addToCartFunc.js'
import parse from 'html-react-parser'
import PropTypes from 'prop-types'

class ItemPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      product: {},
      mainPhoto: 0,
      attributes: [],
      isButtonDisabled: true
    }
    this.onChangeAttr = this.onChangeAttr.bind(this)
    this.findPrice = this.findPrice.bind(this)
  }

  componentDidMount () {
    client
      .query({
        query: PRODUCT,
        variables: { id: this.props.params.itemId }
      })
      .then((res) => {
        this.setState({ product: res.data.product })
        const attributes = []
        res.data.product.attributes.map((attr) =>
          attributes.push({ name: `${res.data.product.id}${attr.name}` })
        )
        this.setState({ attributes: attributes })
        this.state.attributes.length < 1 &&
          this.setState({ isButtonDisabled: false })
      })
  };

  onChangeAttr (e) {
    const newAttrArray = { ...this.state.attributes }
    const objIndex = this.state.attributes.findIndex(
      (obj) => obj.name === e.target.name
    )
    newAttrArray[objIndex].value = e.target.value
    this.state.attributes.every((attr) => attr.value)
      ? this.setState({ isButtonDisabled: false })
      : this.setState({ isButtonDisabled: true })
  }

  findPrice () {
    const currency = this.state.product.prices.find(
      (prod) => prod.currency.label === this.props.currency
    )
    return currency.currency.symbol + currency.amount
  }

  render () {
    return (
      <div className="itemPageContainer">
        {/* photos */}
        {this.state.product.gallery && (
          <div>
            {this.state.product.gallery.map((photo, index) => {
              return (
                <div
                  className="itemPagePhotos"
                  key={photo}
                  style={{ backgroundImage: `url(${photo})` }}
                  onClick={() => this.setState({ mainPhoto: index })}
                ></div>
              )
            })}
          </div>
        )}
        {/* main cover photo */}
        {this.state.product.id && (
          <div
            className="mainPhoto"
            style={{
              backgroundImage: `url(${
                this.state.product.gallery[this.state.mainPhoto]
              })`
            }}
          ></div>
        )}
        {this.state.product.id && (
          <div className="descriptionMenu">
            <h1>{this.state.product.brand}</h1>
            <h2>{this.state.product.name}</h2>
            {/* attributes */}
            <div>
              {this.state.product.attributes.length > 0 &&
                this.state.product.attributes.map((attributeSet) => {
                  return (
                    <div key={attributeSet.id} className="attributeGroup">
                      <h2>{attributeSet.name}</h2>
                      {generateAttributes(
                        attributeSet,
                        this.onChangeAttr,
                        this.state.product.id
                      )}
                    </div>
                  )
                })}
            </div>
            {/* price */}
            <div className="priceTag">
              <p>PRICE:</p>
              <span>{this.findPrice()}</span>
            </div>
            <button
              className="PDPsubmitButton"
              onClick={() =>
                addToCartFunc(this.state.product, this.state.attributes)
              }
              disabled={
                this.state.isButtonDisabled || !this.state.product.inStock
              }
            >
              {this.state.product.inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
            </button>
            <div className="itemDescription">
              {parse(this.state.product.description)}
            </div>
          </div>
        )}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return { currency: state.currency }
}

ItemPage.propTypes = {
  currency: PropTypes.string,
  params: PropTypes.any
}

export default connect(mapStateToProps)(withRouter(ItemPage))
