from search.partitions import integer_partitions_fixed_length


def test_basic_partition():
    result = list(integer_partitions_fixed_length(6, 3))
    assert (1, 1, 4) in result
    assert (1, 2, 3) in result
    assert (2, 2, 2) in result


def test_all_nondecreasing():
    for partition in integer_partitions_fixed_length(10, 3):
        for i in range(len(partition) - 1):
            assert partition[i] <= partition[i + 1]


def test_all_positive():
    for partition in integer_partitions_fixed_length(10, 4):
        assert all(x >= 1 for x in partition)


def test_correct_sum():
    for partition in integer_partitions_fixed_length(12, 5):
        assert sum(partition) == 12


def test_correct_length():
    for partition in integer_partitions_fixed_length(8, 3):
        assert len(partition) == 3


def test_impossible():
    result = list(integer_partitions_fixed_length(2, 5))
    assert result == []


def test_single_part():
    result = list(integer_partitions_fixed_length(7, 1))
    assert result == [(7,)]


def test_all_ones():
    result = list(integer_partitions_fixed_length(5, 5))
    assert result == [(1, 1, 1, 1, 1)]


def test_two_parts():
    result = list(integer_partitions_fixed_length(5, 2))
    assert (1, 4) in result
    assert (2, 3) in result
    assert len(result) == 2


def test_no_duplicates():
    result = list(integer_partitions_fixed_length(10, 4))
    assert len(result) == len(set(result))
