
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Table, Alert, Spinner, Badge
} from 'react-bootstrap';

function BookList() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load books and categories from JSON Server.
  const loadBooks = async () => {
    setLoading(true);
    setError('');

    try {
      const [bookResponse, categoryResponse] = await Promise.all([
        axios.get('http://localhost:3001/books'),
        axios.get('http://localhost:3001/categories')
      ]);

      // Display books that have not been deleted.
      setBooks(
        bookResponse.data.filter(book => !book.isDeleted)
      );

      // Display categories that have not been deleted.
      setCategories(
        categoryResponse.data.filter(category => !category.isDeleted)
      );

    } catch (err) {
      setError('Cannot load book data. Please check JSON Server.');
    } finally {
      setLoading(false);
    }
  };

  // Load data when the component is mounted.
  useEffect(() => {
    loadBooks();
  }, []);

  // Find category name by category ID.
  const getCategoryName = (categoryId) => {
    const category = categories.find(
      item => String(item.id) === String(categoryId)
    );

    return category ? category.name : 'Unknown';
  };

  // Format book price.
  const formatPrice = (price) => {
    return Number(price).toLocaleString('vi-VN') + ' VNĐ';
  };

  return (
    <Container className="my-4">

      {/* Book Management Title */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Book Management</h2>
      </div>

      {/* Display error message */}
      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {/* Display loading spinner */}
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Loading books...</p>
        </div>
      ) : (
        !error && (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Book Name</th>
                <th>Author</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
              </tr>
            </thead>

            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No books found.
                  </td>
                </tr>
              ) : (
                books.map(book => (
                  <tr key={book.id}>
                    <td>{book.id}</td>

                    <td>
                      {book.image && (
                        <img
                          src={book.image}
                          alt={book.title}
                          width="50"
                          height="65"
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                    </td>

                    <td>{book.title}</td>

                    <td>{book.author}</td>

                    <td>{getCategoryName(book.categoryId)}</td>

                    <td>{formatPrice(book.price)}</td>

                    <td>
                      <Badge
                        bg={Number(book.stock) > 0 ? 'success' : 'warning'}
                      >
                        {book.stock}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )
      )}
    </Container>
  );
}

export default BookList;
