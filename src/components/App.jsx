import React, { Component } from 'react';
import { GlobalStyle } from './styles/GlobalStyle';
import { Layout } from './styles/Layout';
import toast, { Toaster } from 'react-hot-toast';
import { nanoid } from 'nanoid';
import * as Yup from 'yup';
import { fetchImages } from './API/API';
import { Searchbar } from './Searchbar/Searchbar';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { Loader } from './Loader/Loader';
import { Button } from './Button/Button';
import { Modal } from './Modal/Modal';

const toastOptions = {
  position: 'top-right',
  duration: 3000,
  style: {
    border: '1px solid #713200',
    padding: '10px',
    color: '#713200',
    fontFamily: 'Ubuntu',
  },
};

const searchSchema = Yup.object().shape({
  query: Yup.string().trim().required('Please enter a search term'),
});

export class App extends Component {
  state = {
    query: '',
    images: [],
    page: 1,
    isLoading: false,
    showModal: false,
    selectedImage: null,
    searchId: nanoid(), 
  };

  handleSearch = async (newQuery) => {
    try {
      await searchSchema.validate({ query: newQuery });

      this.setState({
        query: newQuery,
        images: [],
        page: 1,
        isLoading: true,
        searchId: nanoid(),
      });

      const images = await fetchImages(newQuery, 1);
      this.setState({ images, isLoading: false });
    } catch (error) {
      toast.error(error.message, toastOptions);
    }
  };

  handleLoadMore = async () => {
    const { query, page } = this.state;
    const nextPage = page + 1;
    const newImages = await fetchImages(query, nextPage);

    this.setState((prevState) => ({
      images: [...prevState.images, ...newImages],
      page: nextPage,
    }));
  };

  handleImageClick = (image) => {
    this.setState({ selectedImage: image, showModal: true });
  };

  handleCloseModal = () => {
    this.setState({ showModal: false, selectedImage: null });
  };

  render() {
    const { images, isLoading, showModal, selectedImage, searchId } = this.state; // Додано searchId
    const shouldRenderLoadMoreButton = images.length > 0 && !isLoading;

    return (
      <>
        <GlobalStyle />
        <Layout>
          <Searchbar key={searchId} onSearch={this.handleSearch} />
          <ImageGallery images={images} onItemClick={this.handleImageClick} />
          {isLoading && <Loader />}
          {shouldRenderLoadMoreButton && (
            <Button
              show={images.length >= 12}
              onClick={this.handleLoadMore}
            />
          )}
          {showModal && (
            <Modal
              image={selectedImage}
              onClose={this.handleCloseModal}
            />
          )}
          <Toaster position="top-right" />
        </Layout>
      </>
    );
  }
}
