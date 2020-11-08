import React, { Component } from "react";
import { connect } from "react-redux";
import { reduxForm, Field } from "redux-form";
import { Header, Segment, Input, Label, Form, Button, Message } from "semantic-ui-react";
import { push } from 'react-router-redux';

import BaseLayout from "./../baseLayout";

import { addInventory, setUpdatingInventory, updateInventory } from "./../../actions/InventoryActions";

function validate(values) {
    var errors = {
        batch: {}
    };
    const { productId, productName, price} = values;
    if (!productId || (productId + "").trim() === "") {
        errors.productId = "ProductId is Required";
    }
    if (!productName || productName.trim() === "") {
        errors.productName = "ProductName is Required";
    }
    if (!price || (price + "").trim() === "") {
        errors.price = "Price is Required";
    }
   
    return errors;
}

class AddInventory extends Component {
    componentWillMount() {
        const idParam = this.props.location.pathname.split("/")[2]; // Hacky Way
        const { dispatch } = this.props;
        if (idParam !== "add") {
            dispatch(setUpdatingInventory(idParam));
        }
    }
    renderField({ input, meta: { touched, error }, ...custom }) {
        const hasError = touched && error !== undefined;
        return (
            <div>
                <Input type="text" error={hasError} fluid {...input} {...custom} />
                {hasError && <Label basic color="red" pointing>{error}</ Label>}
            </div>
        )
    }
    onSubmit(values, dispatch) {
        const { token } = this.props.auth;
        values.token = token;
        console.log(values);
        if (values.id) {
            return dispatch(updateInventory(values)).then(function (data) {
                dispatch(push("/inventory"));
            });
        }
        else {
            return dispatch(addInventory(values)).then(function (data) {
                dispatch(push("/inventory"));
            });
        }
    }
    render() {
        const { handleSubmit, pristine, initialValues, errors, submitting } = this.props;
        const { token, user, isLoggingIn, addingInventoryError, inventory } = this.props.inventory;
        let error = null;
        if (addingInventoryError) {
            error = (
                <Message negative>
                    <Message.Header>Error while Adding Inventory</Message.Header>
                    <p>{addingInventoryError}</p>
                </Message>
            )
        }
        let buttonText = null;
        if (inventory) {
            buttonText = "Update Inventory";
        }
        else {
            buttonText = "Add Inventory";
        }
        return (
            <BaseLayout>
                <Segment textAlign='center'>
                    <Header as="h2">Add Inventory</Header>
                    {error}
                    <Form onSubmit={handleSubmit(this.onSubmit.bind(this))} loading={isLoggingIn}>
                        <Form.Field inline>
                            <Field name="productId" placeholder="Enter the Product ID" component={this.renderField}></Field>
                        </Form.Field>
                        <Form.Field inline>
                            <Field name="productName" placeholder="Enter the Product Name" component={this.renderField}></Field>
                        </Form.Field>
                        <Form.Field inline>
                            <Field name="priceName" placeholder="Enter the Price" component={this.renderField}></Field>
                        </Form.Field>
                        <Button loading={submitting} disabled={submitting}>{buttonText}</Button>
                    </Form>
                </Segment>
            </BaseLayout>
        )
    }
}

function mapStatesToProps(state) {
    const initialValues = state.inventory.inventory;
    if (initialValues && initialValues.productName && initialValues.productName.en) {
        initialValues.productName = initialValues.productName.en;
    }
    return {
        initialValues: initialValues,
        auth: state.auth,
        inventory: state.inventory,
        location: state.router.location
    }
}

export default connect(mapStatesToProps)(reduxForm({
    form: "AddInventory",
    validate
})(AddInventory));
